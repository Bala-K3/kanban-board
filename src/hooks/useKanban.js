import { useReducer, useEffect, useRef } from "react";
import { saveBoard, subscribeToBoard } from "../services/kanbanServices";

const KanbanReducer = (state, action) => {
  switch (action.type) {
    case "MOVE_CARD": {
      const { card, from, to, targetId } = action.payload;
      const newSource = state[from].filter((c) => c.id !== card.id);
      let newTarget = [...state[to]].filter((c) => c.id !== card.id);
      const targetIndex = newTarget.findIndex((c) => c.id === targetId);
      if (targetIndex === -1 || from !== to) newTarget.push(card);
      else newTarget.splice(targetIndex, 0, card);
      return {
        ...state,
        [from]: from === to ? state[from] : newSource,
        [to]: newTarget,
      };
    }
    case "ADD_TASK": {
      const newTask = { id: Date.now().toString(), text: action.payload.text };
      return { ...state, todo: [...state.todo, newTask] };
    }
    case "DELETE_TASK": {
      const { cardId, from } = action.payload;
      return { ...state, [from]: state[from].filter((c) => c.id !== cardId) };
    }
    case "EDIT_CARD": {
      const { cardId, from, newText } = action.payload;
      return {
        ...state,
        [from]: state[from].map((c) =>
          c.id === cardId ? { ...c, text: newText } : c
        ),
      };
    }
    case "SET_BOARD":
      return action.payload;
    default:
      return state;
  }
};

const initialState = { todo: [], inProgress: [], done: [] };

export const useKanban = (userId) => {
  const [state, dispatch] = useReducer(KanbanReducer, initialState);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToBoard(userId, (data) => {
      isRemoteUpdate.current = true;
      dispatch({ type: "SET_BOARD", payload: data });
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveBoard(userId, state);
    }, 300);
    return () => clearTimeout(timer);
  }, [state, userId]);

  return { state, dispatch };
};