const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const db = new sqlite3.Database(":memory:"); // 메모리 기반 SQLite DB

app.use(cors());
app.use(express.json());

// 데이터베이스 초기화
db.serialize(() => {
    db.run("CREATE TABLE votes (option TEXT, count INTEGER)");
    db.run("INSERT INTO votes (option, count) VALUES ('yes', 0), ('no', 0)");
});

// 투표 API
app.post("/vote", (req, res) => {
    const { option } = req.body;
    if (option !== "yes" && option !== "no") {
        return res.status(400).json({ error: "잘못된 선택지입니다." });
    }

    db.run("UPDATE votes SET count = count + 1 WHERE option = ?", [option], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 투표 결과 API
app.get("/results", (req, res) => {
    db.all("SELECT * FROM votes", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
