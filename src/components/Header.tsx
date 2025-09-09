import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";

interface HeaderProps {
  title: string;
  username?: string;
  userRole?: string | undefined;
}

export default function Header({ title, username, userRole }: HeaderProps) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    router.push("/login");
  };    

  return (
    <div className="w-full">
        <div className="w-full flex flex-wrap sm:flex-nowrap items-center px-4 sm:px-6 py-3 bg-teal-800 shadow-md fixed top-0 left-0 z-50 gap-2">
          <img src="/logo.jpeg" alt="logo" className="w-8 h-8 rounded-3xl"/>
          <h1 className="font-bold text-xl ml-2 hidden sm:inline">Task Master</h1>
          <span className="font-bold text-white text-lg ml-auto flex items-center gap-2">
            <img src={userRole === "admin" ? "/admin.jpeg" : "/user.jpeg"} alt="" className="w-8 h-8 rounded-3xl" />
            {username || ''}
          </span>
                <button className="bg-red-500 p-2 rounded-2xl text-white font-bold flex items-center gap-2 ml-5" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
        </div>
        <h1 className="text-3xl font-bold text-center mt-15 mb-6 animate-pulse text-white">{title}</h1>
    </div>
  );
}
