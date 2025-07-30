// Debug script to inject into browser console
// Run this in the browser console on the TaskFlow app

console.log("=== TaskFlow Debug Script ===");

// Update token
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg5NWVmMzliNWM2NjE2Y2NjMjg3ODMiLCJ1c2VybmFtZSI6Im5ld3VzZXIiLCJlbWFpbCI6Im5ld3VzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTM4MzMyMDMsImV4cCI6MTc1NDQzODAwM30.wRobW2xS8jhJejBAciwkqdItINqoiEAmkBt72UT1VB8";
localStorage.setItem("token", validToken);
console.log("✅ Token updated in localStorage");

// Force reload to pick up new token
window.location.reload();

// Test function to manually trigger PATCH
window.testTaskCompletion = async function(taskId) {
    const token = localStorage.getItem("token");
    console.log("Testing PATCH with token:", token ? "Present" : "Missing");
    
    try {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: "completed" })
        });
        
        const data = await response.json();
        console.log("PATCH Response:", data);
        return data;
    } catch (error) {
        console.error("PATCH Error:", error);
        return error;
    }
};

console.log("Use window.testTaskCompletion('TASK_ID') to test manually");
