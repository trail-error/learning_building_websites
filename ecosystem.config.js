module.exports = {
    apps: [
      {
        name: "next-app",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3000", 
        cwd: "./",     // root directory
        instances: 1,
        autorestart: true,
        watch: false,
      }
    
    ]
  };
  