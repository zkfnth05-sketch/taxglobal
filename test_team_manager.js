const url = "https://jjdykydkgtosiymxjpmh.supabase.co/rest/v1/";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZHlreWRrZ3Rvc2l5bXhqcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNjIzODQsImV4cCI6MjAxNDgzODM4NH0.gV2jrgbe8ptcdJ0WoD10l1ycFUgHj9nKrx_tNCJzbjU";

async function checkTeamManager() {
  const headers = {
    "apikey": apikey,
    "Authorization": `Bearer ${apikey}`
  };

  const resTeam = await fetch(`${url}Team?select=*`, { headers });
  const teams = await resTeam.json();
  console.log("Teams count:", teams.length);
  console.log("Teams sample:", teams.slice(0, 3));

  const resMgr = await fetch(`${url}Manager?select=*`, { headers });
  const managers = await resMgr.json();
  console.log("Managers count:", managers.length);
  console.log("Managers sample:", managers.slice(0, 5));
}

checkTeamManager();
