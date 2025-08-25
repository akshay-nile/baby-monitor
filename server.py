import os
from flask import Flask, jsonify, request, redirect


# Temporary storage for SDP exchange (WebRTC handshake)
storage = {"offer": None, "answer": None}
app = Flask(__name__)


@app.route("/relay", methods=["GET", "POST"])
def relay():
    global storage

    if request.method == "POST":
        data = request.get_json()
        role = data.get("role")
        sdp = data.get("sdp")
        # Baby device stores its offer
        if role == "offer":
            storage["offer"] = sdp
            return jsonify({"status": "offer-stored"}), 200
        # Parent device stores its answer for the offer
        elif role == "answer":
            storage["answer"] = sdp
            return jsonify({"status": "answer-stored"}), 200
        return jsonify({"error": "Invalid role"}), 400

    if request.method == "GET":
        role = request.args.get("role")
        if role == "parent":
            # Parent asks → send offer
            if storage["offer"]:
                offer = storage["offer"]
                storage["offer"] = None     # Remove the answer once sent
                return jsonify({"sdp": offer}), 200
            else:
                return jsonify({"error": "No offer yet"}), 404
        elif role == "baby":
            # Baby asks → send answer
            if storage["answer"]:
                answer = storage["answer"]
                storage["answer"] = None    # Remove the answer once sent
                return jsonify({"sdp": answer}), 200
            else:
                return jsonify({"error": "No answer yet"}), 404

    storage = {"offer": None, "answer": None}
    return jsonify({"error": "role required"}), 400


@app.errorhandler(404)
def page_not_found(error):
    index_html = f"./static/{request.path.strip('/')}/index.html"
    if os.path.isfile(index_html):
        return redirect(index_html)
    return error, 404


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
