import { Todo } from "../types/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  userRole: string | undefined;
  onDelete: (id: string) => void;
  onUpdate: (id: string, currentDescription: string) => void;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
}

export default function TodoList({ todos, userRole, onDelete, onUpdate, onToggleComplete }: TodoListProps) {
  if (!todos.length)
    return <p className="text-gray-100 mt-5 ms-3">No todos available.</p>;

  return (
    <ul className="mt-3">
      {todos.map(todo => (
        <TodoItem
          key={todo._id}
          id={todo._id}
          description={todo.description}
          complete={todo.complete}
          userRole={userRole}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </ul>
  );
}
