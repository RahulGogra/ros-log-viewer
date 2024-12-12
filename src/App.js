import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [file, setFile] = useState(null);
    const [severityFilter, setSeverityFilter] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "http://localhost:8000/upload",
                formData
            );
            setLogs(response.data.logs);
            setFilteredLogs(response.data.logs);
            setCurrentPage(1);
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                    "An error occurred while uploading the file."
            );
        }
    };

    const handleFilter = async () => {
        if (!severityFilter) {
            setFilteredLogs(logs);
            setCurrentPage(1);
            return;
        }

        const filtered = logs.filter(
            (log) => log.severity === severityFilter.toUpperCase()
        );
        setFilteredLogs(filtered);
        setCurrentPage(1);
    };

    const handleSearch = () => {
        if (!searchKeyword) {
            setFilteredLogs(logs);
            setCurrentPage(1);
            return;
        }

        const searched = logs.filter((log) =>
            log.message.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setFilteredLogs(searched);
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="App">
            <h1>ROS Log Viewer</h1>
            <div>
                <input
                    type="file"
                    accept=".log,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={handleUpload}>Upload Log File</button>
            </div>

            <div className="filters">
                <select
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    value={severityFilter}
                >
                    <option value="">All Severities</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                    <option value="FATAL">FATAL</option>
                </select>
                <button onClick={handleFilter}>Filter</button>

                <input
                    type="text"
                    placeholder="Search by keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <table border="1">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Severity</th>
                        <th>Node</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((log, index) => (
                        <tr
                            key={index}
                            style={{
                                color:
                                    log.severity === "ERROR"
                                        ? "red"
                                        : log.severity === "WARN"
                                        ? "orange"
                                        : "black",
                                backgroundColor:
                                    log.severity === "FATAL" ? "red" : "",
                            }}
                        >
                            <td>{log.timestamp}</td>
                            <td>{log.severity}</td>
                            <td>{log.node}</td>
                            <td>{log.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                ).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={
                            currentPage === pageNumber ? "active" : "inactive"
                        }
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default App;
