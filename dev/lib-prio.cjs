try { require('os').setPriority(process.pid, 19); } catch (e) { /* brak uprawnień: trudno */ }
