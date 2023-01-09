module.exports = function (RED) {

    function ModulusCounter(n) {
        RED.nodes.createNode(this, n);

        this.name = n.name;
        this.numStates = parseInt(n.numStates);
        this.triggerOn = n.triggerOn;
        this.outputDebugInfo = n.outputDebugInfo;

        const node = this;

        let state = 0;
        let cycleStart = Date.now();

        // port count
        const outputCount = 1 + (node.outputDebugInfo ? 1 : 0);

        if (node.outputDebugInfo) {
            node.trace(`total outputs: ${outputCount}`);
        }

        node.on("input", (msg, send, done) => {

            // do we need to first reset before processing
            // the input?
            let resetRequest = undefined;
            let setRequest = undefined;

            if (Array.isArray(msg.payload)) {
                resetRequest = msg.payload
                    .find(p => p.topic === "reset" && p.value === 1);
                setRequest = msg.payload
                    .find(p => p.topic === "set");
            } else if (typeof msg.payload === "object") {
                if (msg.payload.topic !== undefined) {
                    node.trace(`Payload: ${JSON.stringify(msg.payload)}`);
                    resetRequest = msg.payload.topic === "reset" ? msg.payload : undefined;
                    setRequest = msg.payload.topic === "set" ? msg.payload : undefined;
                }
            } else if (typeof msg.payload === "number") {
                setRequest = {
                    value: msg.payload
                };
            }

            // is there a reset request?
            if (resetRequest) {
                node.trace(`Resetting counter`);
                state = 0;
            }

            if (setRequest) {
                const setValue = msg.payload.value;

                if (node.triggerOn === "both"
                    || (node.triggerOn === "1" && setValue === 1)
                    || (node.triggerOn === "0" && setValue === 0)) {

                    state = state === 0 ? 1 : (state << 1);

                    const outputs = [(state >> this.numStates - 1) & 1];

                    if (node.outputDebugInfo) {
                        node.trace(`current state: ${state}`);
                    }

                    if (node.outputDebugInfo) {
                        outputs.push({
                            state: state,
                            output: outputs[0]
                        });
                    }

                    // check if the last one is a 1
                    // if so we need to circle back
                    if (outputs[0] === 1) {
                        const cycleEnd = Date.now();
                        if (node.outputDebugInfo) {
                            node.trace(`cycle length: ${(cycleEnd - cycleStart) / 1000} secs`);
                        }
                        cycleStart = cycleEnd;
                        state = 0;
                    }

                    send(outputs.map(p => ({
                        payload: p
                    })));

                }

                // all done
                done();
            }
        });


    }

    RED.nodes.registerType("mod-n counter", ModulusCounter);
}