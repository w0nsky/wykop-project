import react from "react";
import './styles/index.css';

function App() {
  
  return (
    <>
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Hello Tailwind!
        </h1>
        <p className="mt-4 text-gray-700">
          Test czy działa tailwind i daisyui
        </p>
        <div className="flex flex-col gap-1.5">
          <progress className="progress progress-primary w-56" value={0} max="100"></progress>
          <progress className="progress progress-primary w-56" value="10" max="100"></progress>
          <progress className="progress progress-primary w-56" value="40" max="100"></progress>
          <progress className="progress progress-primary w-56" value="70" max="100"></progress>
        </div>
      </div>
      </div>
    </>
  )
}

export default App
