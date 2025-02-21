function DeleteBox({ onDropTask }) {
    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedData = JSON.parse(e.dataTransfer.getData("application/json"));
        const { taskId } = droppedData; // no usaremos sourceColumn, ya que solo necesitamos el ID
        onDropTask(taskId);
    };

    return (
        <div
            style={{
                backgroundColor: "red",
                color: "#fff",
                padding: "10px",
                textAlign: "center",
                borderRadius: "8px",
                marginTop: "10px",
                cursor: "pointer",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            Drag here to Delete
        </div>
    );
}
