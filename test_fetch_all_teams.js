const url = "https://jjdykydkgtosiymxjpmh.supabase.co/rest/v1/";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZHlreWRrZ3Rvc2l5bXhqcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNjIzODQsImV4cCI6MjAxNDgzODM4NH0.gV2jrgbe8ptcdJ0WoD10l1ycFUgHj9nKrx_tNCJzbjU";

async function run() {
  const headers = {
    "apikey": apikey,
    "Authorization": `Bearer ${apikey}`
  };

  const resTeam = await fetch(`${url}Team?select=*&order=id.desc`, { headers });
  const teams = await resTeam.json();

  const resMgr = await fetch(`${url}Manager?select=*&order=createdAt.desc`, { headers });
  const managers = await resMgr.json();

  console.log("=== TEAMS ===");
  console.log(teams);

  console.log("=== MANAGERS ===");
  console.log(managers.map(m => ({ id: m.id, name: m.name, teamId: m.teamId, isConfirmed: m.isConfirmed, createdAt: m.createdAt })));
}

run();
