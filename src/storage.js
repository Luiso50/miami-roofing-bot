const fs = require('fs');
const path = require('path');

const LEADS_FILE = path.join(__dirname, '../leads.json');

function saveLead(leadData) {
  try {
    let leads = [];
    if (fs.existsSync(LEADS_FILE)) {
      const fileContent = fs.readFileSync(LEADS_FILE, 'utf8');
      leads = JSON.parse(fileContent || '[]');
    }
    
    leads.push(leadData);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    console.log('[Storage] Lead guardado exitosamente en leads.json');
  } catch (error) {
    console.error('[Storage] Error al guardar el lead:', error);
  }
}

module.exports = { saveLead };