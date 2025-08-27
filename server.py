from flask import Flask, jsonify, request, redirect
from flask_cors import CORS


# Temporary storage for SDP exchange (WebRTC handshake)
storage = {"offer": None, "answer": None}

app = Flask(__name__)
CORS(app)


@app.route("/exchange", methods=["GET", "POST"])
def exchange():
    global storage

    if request.method == "POST":
        sdp = request.get_json()
        if sdp["type"] == "offer":
            storage["offer"] = sdp
            return jsonify({"status": "offer-stored"}), 200
        elif sdp["type"] == "answer":
            storage["answer"] = sdp
            return jsonify({"status": "answer-stored"}), 200
        return jsonify({"error": "invalid-sdp-type"}), 400

    if request.method == "GET":
        type = request.args.get("type")
        if type == "offer":
            if storage["offer"]:
                sdp = storage["offer"]
                storage["offer"] = None
                return jsonify(sdp), 200
            else:
                return jsonify({"error": "offer-not-found"}), 404
        elif type == "answer":
            if storage["answer"]:
                sdp = storage["answer"]
                storage["answer"] = None
                return jsonify(sdp), 200
            else:
                return jsonify({"error": "answer-not-found"}), 404

    storage = {"offer": None, "answer": None}
    return jsonify({"error": "something-went-wrong"}), 500


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
