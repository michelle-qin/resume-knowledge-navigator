import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Button,
} from "react-native";

export default function App() {
  const [resumeUri, setResumeUri] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef(null);

  const pickDocument = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Use the ref to trigger the file input click
    } else {
      console.error("The file input is not yet available.");
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeUri(URL.createObjectURL(file));
    }
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessages = [
        ...messages,
        { text: inputText, time: new Date(), sender: "user" },
      ];
      setMessages(newMessages);
      setInputText("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Contents Column */}
      <View style={[styles.column, styles.contentsColumn]}>
        <Text style={styles.columnTitle}>Contents</Text>
        <View style={styles.topBar}></View>
        {/* Content for the Contents Column */}
      </View>

      {/* View Column */}
      <View style={[styles.column, styles.viewColumn]}>
        <Text style={styles.columnTitle}>View</Text>
        <View style={styles.topBar}></View>
        {resumeUri ? (
          <iframe
            src={resumeUri}
            style={styles.iframeStyle}
            title="Resume"
            seamless
          />
        ) : (
          <>
            <Button title="Import Resume" onPress={pickDocument} />
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
          </>
        )}
      </View>

      {/* Chat Column */}
      <View style={[styles.column, styles.chatColumn]}>
        <Text style={styles.columnTitle}>Chat</Text>
        <View style={styles.topBar}></View>
        <ScrollView style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sender === "user"
                  ? styles.userMessage
                  : styles.aiMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>
                {message.time.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter your message..."
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    fontFamily: "Helvetica",
  },
  topBar: {
    height: 4,
    width: "100%",
    backgroundColor: "#333",
  },
  contentsColumn: {
    backgroundColor: "#ececec",
  },
  viewColumn: {
    flex: 2,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  iframeStyle: {
    width: "100%",
    height: "calc(100% - 4px)", // Adjust height to take into account the topBar height
    borderWidth: 0,
  },
  chatColumn: {
    backgroundColor: "#ececec",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    width: "100%",
  },
  messageBubble: {
    padding: 10,
    marginTop: 8,
    maxWidth: "80%",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#E7E9FD",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0", // A light grey background for AI messages
  },
  inputContainer: {
    flexDirection: "row",
    padding: 0,
    width: "100%", // Make sure the container takes the full width of its parent
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 1,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 0,
  },
  sendButton: {
    width: 80,
    backgroundColor: "#007bff",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  sendButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});
