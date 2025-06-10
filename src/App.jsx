import { useState } from 'react'
import './App.css'
import KanbanBoard from './KanbanBoard'


function App() {
  return (
    <div>
        <h1 style={{textAlign:'center'}}>Kanban Board</h1>
       <KanbanBoard/>
    </div>
  )
}

export default App;