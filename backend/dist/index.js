"use strict";
/**
 * Backend entry point.
 * Starts the HTTP server using the configured Express app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('./app');
const { env } = require('./config/env');
app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
});
//# sourceMappingURL=index.js.map