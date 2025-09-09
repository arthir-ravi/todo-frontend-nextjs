import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faCheck } from '@fortawesome/free-solid-svg-icons';

interface TodoItemProps {
  id: string;
  description: string;
  complete: boolean;
  userRole: string | undefined;
  onDelete: (id: string) => void;
  onUpdate: (id: string, currentDescription: string) => void;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
}

export default function TodoItem({ id, description, complete,userRole, onDelete, onUpdate, onToggleComplete}: TodoItemProps) {
  return (
    <li className={`mt-2 flex flex-row justify-between p-2 rounded-xl shadow transition ${complete 
    ? "bg-teal-950 opacity-70" 
    : "bg-teal-700 hover:bg-teal-600"}`}
    >
  <div className="flex items-center gap-3 sm:w-[700px] md:w-[600px] lg:w-[700px] w-full flex-1 min-w-0">
    {userRole !== 'admin' && (
      <button onClick={() => onToggleComplete(id, complete)} className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition 
        ${complete ? "bg-white border-white text-teal-800" : "border-white text-white hover:border-gray-200 hover:text-gray-200"}`}>
        {complete && <FontAwesomeIcon icon={faCheck} />}
      </button>
    )}

    <span className={`${complete ? "line-through text-gray-100" : "text-white"} font-medium break-words flex-1 min-w-0`}>
      {description}
    </span>
  </div>

  <div className="flex gap-3 mt-2 sm:mt-0 flex-shrink-0">
    <button onClick={() => onUpdate(id, description)} className="text-yellow-400 hover:text-yellow-300"><FontAwesomeIcon icon={faPen} /></button>
    <button onClick={() => onDelete(id)} className="text-red-400 hover:text-red-300"><FontAwesomeIcon icon={faTrash} /></button>
  </div>
</li>
  );
}
