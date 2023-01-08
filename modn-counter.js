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

            if (node.triggerOn === "both"
                || (node.triggerOn === "1" && msg.payload === 1)
                || (node.triggerOn === "0" && msg.payload === 0)) {

                state = state === 0 ? 1 : (state << 1);

                const outputs = [(state >> this.numStates - 1) & 1];

                //
                // const ports = new Array(node.numStates)
                //     .fill(0)
                //     .map((p, i) => (state >> i) & 1);

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
        });

    }

    RED.nodes.registerType("mod-n counter", ModulusCounter);
}