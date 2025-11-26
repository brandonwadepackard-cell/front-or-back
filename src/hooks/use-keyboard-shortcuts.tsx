import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl/Cmd + Shift is pressed
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            navigate("/");
            break;
          case "c":
            e.preventDefault();
            navigate("/content");
            break;
          case "t":
            e.preventDefault();
            navigate("/templates");
            break;
          case "r":
            e.preventDefault();
            navigate("/history");
            break;
          case "a":
            e.preventDefault();
            navigate("/analytics");
            break;
          case "l":
            e.preventDefault();
            navigate("/calendar");
            break;
          case "b":
            e.preventDefault();
            navigate("/bulk-schedule");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
};
