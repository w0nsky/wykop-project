import LoginForm from "./components/LoginForm";
import "./styles/index.css";

function App() {
  return (
    <>
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-4xl font-bold text-center text-blue-600">
            Hello Tailwind!
          </h1>
          <LoginForm />
        </div>
      </div>
    </>
  );
}

export default App;
