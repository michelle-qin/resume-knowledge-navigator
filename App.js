import React, { useState, useRef } from "react";
import { default as ReactReduxFromImport, Provider } from "react-redux";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Button,
} from "react-native";
import ToC from "./components/ToC.js";
import { ModalityProvider } from "reactgenie-lib";
import { reactGenieStore } from "./store.js";

import ENV from "./config.js";

export default function App() {
  const [resumeUri, setResumeUri] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentDocID, setCurrentDocID] = useState(null); // TODO: Use this to fetch the resume from the backend
  const fileInputRef = useRef(null);

  const data = {
    Summary:
      "Accounting professional with twenty years of experience in inventory and manufacturing accounting. Ability to fill in at a moment's notice, quickly mastering new systems, processes and workflows. Take charge attitude, ability to work independently, recommend and implement ideas and process improvements.",
    Skills:
      "Microsoft Office Excel, Outlook and Word, SAGE 100, Ramp (WMS software) and Syspro (ERP program)",
    Experience: [
      "Company Name City , State Accountant 04/2011 to 05/2017",
      "Company Name City , State Inventory Control Manager 01/2008 to 01/2010",
      "Company Name City , State Accounting Manager 01/1995 to 01/2008",
      "Company Name City , State Full Charge Bookkeeper 01/1993 to 01/1995",
    ],
    "Education and Training":
      "B.S : Business Administration Accounting Montclair State College Business Administration Accounting",
    "Additional Skills":
      "accounting, general accounting, accruals, ADP, Ad, balance, budget, business process improvement, cash flow, closing, cost control, credit, customer service, database, debit, documentation, ERP, financial, financial statements, general ledger, human resource, insurance, Inventory, inventory levels, logistics, MAS90, Excel, Microsoft Office, Outlook, Word, negotiations, payroll, PL, processes, progress, purchasing, receiving, repairing, researching, SAGE, sales, spreadsheet, tax, year-end",
  };
  const [toc, setToc] = useState(data);

  const pickDocument = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Use the ref to trigger the file input click
    } else {
      console.error("The file input is not yet available.");
    }
  };

  // const handleFileInput = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setResumeUri(URL.createObjectURL(file));
  //   }

  //   // 1. CALL ADD DOC
  //   fetch("/add_doc").then((response) =>
  //     response.json().then((info) => {
  //       setCurrentDocID(info.id);
  //     })
  //   );

  //   // 2. DISPLAY ASSETS/PDF (using doc id)
  // };

  const handleFileInput = async (event) => {
    const file = event.target.files[0];
    console.log("FILE: ", file);
    if (file) {
      // Prepare the file to be sent in a FormData object
      const formData = new FormData();
      formData.append("pdf_file", file);

      console.log(formData.get("pdf_file")); // This should log the file object if it's been appended
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
        console.log(value instanceof File);
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/add_doc", {
          method: "POST",
          body: formData,
        });
        console.log("RESPONSE: ", response);
        if (response.status == 200) {
          const data = await response.json();
          console.log("DATA: ", data);
          const docId = data.id;
          console.log("DOCID: ", docId);
          // const pdfUri = `assets/${docId}.pdf`;
          const pdfUri = `http://127.0.0.1:5000/pdf/Rose Kuan Resume.pdf`; // TODO HARD CODING FOR NOW
          console.log("PDF URI: ", pdfUri);
          setResumeUri(pdfUri);
          console.log("RESUME URI: ", resumeUri);
        } else {
          const errorData = await response.json();
          console.error("File upload error:", errorData.message);
        }
      } catch (error) {
        console.error("Network or other error", error);
      }
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
    <Provider store={reactGenieStore}>
      {/* <ModalityProvider
        displayTranscript={true}
        codexApiKey={ENV.OPENAI_API_KEY}
        codexApiBaseUrl={ENV.OPENAI_API_BASE_URL}
        azureSpeechRegion={ENV.AZURE_SPEECH_REGION}
        azureSpeechKey={ENV.AZURE_SPEECH_KEY}
        extraPrompt={
          '// we are using voice recognition. so there may be errors. Try to think about words with similar sounds. For example "address" can actually be "add this".'
        }
      > */}
      <View style={styles.container}>
        {/* Contents Column */}
        <View style={[styles.column, styles.contentsColumn]}>
          <Text style={styles.columnTitle}>Contents</Text>
          <View style={styles.topBar}></View>
          {/* Content for the Contents Column */}
          <ToC style={styles.toc} data={toc} doc_id={currentDocID} />
        </View>

        {/* View Column */}
        <View style={[styles.column, styles.viewColumn]}>
          <View style={styles.titleContainer}>
            <Text style={styles.columnTitle}>View</Text>
            <Button title="Import Resume" onPress={pickDocument} />
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
          </View>
          <View style={styles.topBar}></View>
          {resumeUri ? (
            <iframe
              src={resumeUri}
              style={styles.iframeStyle}
              title="Resume"
              seamless
            />
          ) : (
            <></>
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
      {/* </ModalityProvider> */}
    </Provider>
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  toc: {
    flex: 1,
    backgroundColor: "#ececec",
  },
});
