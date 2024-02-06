class Config {
    // general settings
    static title = "BomberMan Mayhem";
    version = "Version 0.0.1";
    lang = "en";

    // server settings
    port = 3000;
    maxClients = 20; // set maximum clients per room
    updateRate = 100; // Set frequency the patched state should be sent to all clients, in milliseconds
    databaseUpdateRate = 10000; // the frequency at which server save players position
}

export { Config };
