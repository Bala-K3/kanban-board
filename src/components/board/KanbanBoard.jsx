import { useState, useEffect, useContext, useRef, useMemo, createContext } from "react";
import { useKanban } from "../../hooks/useKanban";
import { useAuth } from "../../context/authContext";
import { logout } from "../../services/authServices";
import "./KanbanBoard.css";

const KanbanContext = createContext();

// ─── TaskInput ────────────────────────────────────────────────────────────────
const TaskInput = () => {
  const { dispatch } = useContext(KanbanContext);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "ADD_TASK", payload: { text } });
    setText("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        placeholder="Add new task..."
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ card, from, dispatch }) => {
  const dragRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(card.text);
  const inputRef = useRef(null);

  useEffect(() => { setEditedText(card.text); }, [card.text]);

  const handleDragStart = (e) => {
    if (!isEditing)
      e.dataTransfer.setData("card", JSON.stringify({ card, from }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("card"));
    dispatch({
      type: "MOVE_CARD",
      payload: { card: data.card, from: data.from, to: from, targetId: card.id },
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditSubmit = () => {
    const trimmed = editedText.trim();
    if (trimmed && trimmed !== card.text)
      dispatch({ type: "EDIT_CARD", payload: { cardId: card.id, from, newText: trimmed } });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleEditSubmit();
    else if (e.key === "Escape") { setEditedText(card.text); setIsEditing(false); }
  };

  return (
    <div
      className="card"
      draggable
      ref={dragRef}
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
          className="edit-input"
        />
      ) : (
        <span>{card.text}</span>
      )}
    </div>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const Column = ({ title, columnkey, className }) => {
  const { state, dispatch } = useContext(KanbanContext);
  const dropRef = useRef(null);

  useEffect(() => {
    const el = dropRef.current;
    const handleDrop = (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("card"));
      dispatch({ type: "MOVE_CARD", payload: { card: data.card, from: data.from, to: columnkey } });
    };
    const handleDragOver = (e) => e.preventDefault();
    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("drop", handleDrop);
    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("drop", handleDrop);
    };
  }, [dispatch, columnkey]);

 return (
    <div className={`column ${className}`} ref={dropRef}>
      <div className="column-header">
        <div className="column-dot" />
        <h2>{title}</h2>
        <span className="column-count">{state[columnkey].length}</span>
      </div>
      {state[columnkey].map((card) => (
        <Card key={card.id} card={card} from={columnkey} dispatch={dispatch} />
      ))}
    </div>
  );
};

// ─── TrashDropZone ────────────────────────────────────────────────────────────
const TrashDropZone = ({ setCardToDelete }) => {
  const dropRef = useRef(null);

  useEffect(() => {
    const el = dropRef.current;
    const handleDrop = (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("card"));
      setCardToDelete({ cardId: data.card.id, from: data.from });
    };
    const handleDragOver = (e) => e.preventDefault();
    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("drop", handleDrop);
    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("drop", handleDrop);
    };
  }, [setCardToDelete]);

  return <div className="trash-drop-zone" ref={dropRef}>🗑️ Delete</div>;
};

// ─── UserHeader ───────────────────────────────────────────────────────────────
const UserHeader = ({ user }) => {
  const handleLogout = async () => {
    try { await logout(); }
    catch (err) { console.error("Logout failed:", err); }
  };

  return (
    <div className="user-header">
      <div className="navbar-brand">
        <span className="navbar-logo">📋</span>
        <span className="navbar-title">KanbanFlow</span>
      </div>
      <div className="user-info">
        {user.photoURL
          ? <img src={user.photoURL} alt="avatar" className="user-avatar" />
          : <div className="user-avatar-placeholder">👤</div>
        }
        <span className="user-name">{user.displayName || user.email}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};


// ─── KanbanBoardUI ────────────────────────────────────────────────────────────
const KanbanBoardUI = () => {
  const { state, dispatch } = useContext(KanbanContext);
  const { user } = useAuth();
  const [cardToDelete, setCardToDelete] = useState(null);

  const cardText = useMemo(() => {
    if (!cardToDelete) return "";
    const card = (state[cardToDelete.from] || []).find((c) => c.id === cardToDelete.cardId);
    return card?.text || "this task";
  }, [cardToDelete, state]);

  return (
    <div className="board-container">
      <UserHeader user={user} />
      <TaskInput />
      <div className="board">
        <Column title="To Do"       columnkey="todo"       className="column-red"    />
        <Column title="In Progress" columnkey="inProgress" className="column-yellow" />
        <Column title="Done"        columnkey="done"       className="column-green"  />
        <TrashDropZone setCardToDelete={setCardToDelete} />

        {cardToDelete && (
          <div className="modal">
            <div className="modal-content">
              <p>Are you sure you want to delete? <strong>{cardText}</strong></p>
              <button className="btn-confirm" onClick={() => {
  dispatch({ type: "DELETE_TASK", payload: { cardId: cardToDelete.cardId, from: cardToDelete.from } });
  setCardToDelete(null);
}}>Yes, Delete</button>
<button className="btn-cancel" onClick={() => setCardToDelete(null)}>No, Keep it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── KanbanBoard (root export) ────────────────────────────────────────────────
const KanbanBoard = () => {
  const { user } = useAuth();
  const { state, dispatch } = useKanban(user?.uid);
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <KanbanContext.Provider value={contextValue}>
      <KanbanBoardUI />
    </KanbanContext.Provider>
  );
};

export default KanbanBoard;