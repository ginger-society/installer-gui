import { useEffect, useState } from "react";
import { LinearProgress, Typography } from "@mui/material";

const InstallProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => Math.min(oldProgress + 10, 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Typography variant="h6">Installing...</Typography>
      <LinearProgress variant="determinate" value={progress} />
      
    </div>
  );
};

export default InstallProgress;
