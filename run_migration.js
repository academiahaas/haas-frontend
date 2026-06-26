const fs = require('fs');
const { Client } = require('pg');

// Rota direta usando o DNS do seu próprio projeto para mapear a região correta automaticamente
const connectionString = "postgresql://postgres.jdppxfokfhqjudwfwckd:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:6543/postgres";

async function run() {
    console.log("🚀 Iniciando migração via Rota Direta do Projeto...");
    const sql = fs.readFileSync('insert_a2_m1.sql', 'utf8');
    
    const client = new Client({ 
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await client.connect();
        console.log("📡 Conectado ao Pooler do Supabase com sucesso!");
        
        await client.query(sql);
        console.log("✅ Dados das lições inseridos com sucesso na tabela 'lessons'!");
    } catch (err) {
        console.error("❌ Erro durante a execução da query:", err.message);
    } finally {
        await client.end();
    }
}

run();
