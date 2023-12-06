import React, { useState, useRef, useEffect } from "react";
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

import { SvgUri } from 'react-native-svg';
import { Picker } from "@react-native-picker/picker";
import ToC from "./components/ToC.js";
import { ModalityProvider } from "reactgenie-lib";
import { reactGenieStore } from "./store.js";

import ENV from "./config.js";
import { StoreExamples } from "./genie/store.ts";
import SvgComponent from "./svg.js";

export default function App() {
  const [resumeUri, setResumeUri] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentDocID, setCurrentDocID] = useState(null);
  const [currentDocName, setCurrentDocName] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [highlighted, setHighlighted] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [docsToShow, setDocsToShow] = useState([]);

  const fileInputRef = useRef(null);
  // const fileInputRefs = useRef(Array.from({ length: numberOfFileInputs }, () => createRef()));


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

  const handleMultipleFileSelect = async (event) => {
    const chosenFiles = Array.prototype.slice.call(event.target.files);
    handleMultipleFileUpload(chosenFiles);
  }

  const handleMultipleFileUpload = async (chosenFiles) => {
    for (let i = 0; i < chosenFiles.length; i++) {
      const file = chosenFiles[i];
      const formData = new FormData();
      formData.append("pdf_file", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/add_doc", {
          method: "POST",
          body: formData,
        });
        if (response.status == 200) {
          const data = await response.json();
          const docId = data.id;
          const pdfUri = `http://127.0.0.1:5000/pdf/${docId}.pdf`;
          const name = data.filename;

          if (!uploadedFiles.some(file => file.docId === docId)) {
            const pdf = {
              docId: docId,
              pdfUri: pdfUri,
              name: name,
            };
            setUploadedFiles(prevFiles => [...prevFiles, pdf]);
            setDocsToShow(prev => [...prev, docId]);
          }

          if (i == 0) {
            setResumeUri(pdfUri);
            setCurrentDocID(docId);
            setCurrentDocName(name);
          }

        } else {
          const errorData = await response.json();
          console.error("File upload error:", errorData.message);
        }
      } catch (error) {
        console.error("Network or other error", error);
      }
    }

  }

  const handleFileInput = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("pdf_file", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/add_doc", {
          method: "POST",
          body: formData,
        });
        if (response.status == 200) {
          const data = await response.json();
          const docId = data.id;
          const pdfUri = `http://127.0.0.1:5000/pdf/${docId}.pdf`;
          setCurrentDocID(docId);
          setResumeUri(pdfUri);
        } else {
          const errorData = await response.json();
          console.error("File upload error:", errorData.message);
        }
      } catch (error) {
        console.error("Network or other error", error);
      }
    }
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputText, time: new Date(), sender: "user" },
        { text: "Thinking...", time: new Date(), sender: "ai" },
      ]);

      setInputText("");

      try {
        let query = inputText;

        // incorporate highlighted text into query
        if (highlighted && highlighted.length > 0) {
          const highlightResponse = await fetch("http://127.0.0.1:5000/inject_highlighted", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              og_query: inputText,
              highlighted_text: highlighted
            }),
          });

          const jsonResponse = await highlightResponse.json();
          query = jsonResponse.injected_prompt;
        }

        console.log(query);

        const response = await fetch("http://127.0.0.1:5000/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doc_id: currentDocID,
            query: query,
          }),
        });

        let aiMessageText;
        if (response.status == 200) {
          aiMessageText = "See highlights.";
          setIframeKey((prevKey) => prevKey + 1);
        } else {
          aiMessageText = "I'm sorry, I can't find that info.";
        }

        // Replace "Thinking..." with the actual response
        setMessages((prevMessages) => [
          ...prevMessages.filter((message) => message.text !== "Thinking..."),
          { text: aiMessageText, time: new Date(), sender: "ai" },
        ]);
      } catch (error) {
        console.error("Network or other error:", error);

        setMessages((prevMessages) => [
          ...prevMessages.filter((message) => message.text !== "Thinking..."),
          {
            text: "There was an error, please try again.",
            time: new Date(),
            sender: "ai",
          },
        ]);
      }
    }
  };

  const filterDocuments = async () => {
    if (inputText.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputText, time: new Date(), sender: "user" },
        { text: "Thinking...", time: new Date(), sender: "ai" },
      ]);

      setInputText("");

      try {
        let query = inputText;

        // incorporate highlighted text into query
        if (highlighted && highlighted.length > 0) {
          const highlightResponse = await fetch("http://127.0.0.1:5000/inject_highlighted", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              og_query: inputText,
              highlighted_text: highlighted
            }),
          });

          const jsonResponse = await highlightResponse.json();
          query = jsonResponse.injected_prompt;
        }

        console.log(query);

        const docIds = uploadedFiles.map((file) => file.docId);
        console.log(docIds);

        const response = await fetch("http://127.0.0.1:5000/query_multiple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doc_ids: docIds,
            query: query,
          }),
        });

        console.log(response);
        const multipleResponse = await response.json();
        const nestedObject = Object.values(multipleResponse)[1];

        let docIdsToShow = [];
        console.log(nestedObject);

        for (let i = 0; i < nestedObject.length; i++) {
          if (nestedObject[i] !== "None") {
            docIdsToShow.push(docIds[i]);
          }
        }

        console.log(docIdsToShow);
        setDocsToShow(docIdsToShow);

        let aiMessageText;
        if (response.status == 200) {
          aiMessageText = "Updated document list.";
          // setIframeKey((prevKey) => prevKey + 1);
        } else {
          aiMessageText = "I'm sorry, I can't update the list.";
        }

        // Replace "Thinking..." with the actual response
        setMessages((prevMessages) => [
          ...prevMessages.filter((message) => message.text !== "Thinking..."),
          { text: aiMessageText, time: new Date(), sender: "ai" },
        ]);
      } catch (error) {
        console.error("Network or other error:", error);

        setMessages((prevMessages) => [
          ...prevMessages.filter((message) => message.text !== "Thinking..."),
          {
            text: "There was an error, please try again.",
            time: new Date(),
            sender: "ai",
          },
        ]);
      }
    }
  };

  return (
    <Provider store={reactGenieStore}>
      {/* <ModalityProvider
        examples={StoreExamples}
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
            <Picker
              style={styles.picker}
              selectedValue={currentDocName}
              onValueChange={(itemValue, itemIndex) => {
                console.log(itemValue);
                console.log(itemIndex);
                const selectedFile = uploadedFiles[itemIndex];
                console.log(selectedFile);
                setCurrentDocName(selectedFile.name)
                setCurrentDocID(selectedFile.docId);
                setResumeUri(selectedFile.pdfUri);
              }}
            >
              {uploadedFiles
                .filter((file) => {
                  return docsToShow.includes(file.docId);
                })
                .map((file, index) => (
                  <Picker.Item key={index} label={file.name} value={file.name} />
                ))}
            </Picker>
            <Text style={styles.columnTitle}>View</Text>
            <Button onPress={() => {
              console.log(uploadedFiles);
              console.log(docsToShow);
            }} />
            <TouchableOpacity
              onPress={pickDocument}
              style={styles.importButton}
            >
              <Text style={styles.importButtonText}>Import Resume</Text>
            </TouchableOpacity>
            <input
              type="file"
              accept="application/pdf"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleMultipleFileSelect}
            />
          </View>
          <View style={styles.topBar}></View>
          {resumeUri ? (
            <iframe
              key={iframeKey}
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
          <View style={styles.highlightedContainer}>
            {highlighted && highlighted.length > 0 ? (
              <>
                <View style={styles.highlightedText}>
                  <Text>{highlighted}</Text>
                </View>
                <Button color="#FFA500" title="Remove text from query" onPress={() => {
                  setHighlighted("");
                }} />
              </>
            ) : (
              <Button title="Add highlighted text to query" onPress={() => {
                setHighlighted(window.getSelection().toString());
              }} />
            )

            }
          </View>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={filterDocuments}
              style={{
                padding: 4, backgroundColor: "white", borderWidth: 1,
                borderColor: "#999",
                borderRadius: 0,
              }}>
              <SvgComponent />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Enter your message..."
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* </ModalityProvider> */}
    </Provider >
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  iframeStyle: {
    width: "100%",
    height: "calc(100% - 4px)",
    borderWidth: 0,
  },
  chatColumn: {
    backgroundColor: "#ececec",
    flex: 1,
    justifyContent: "flex-end",
  },
  messagesContainer: {
    flex: 1,
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
    backgroundColor: "#f0f0f0",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 0,
    width: "100%",
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
  importButton: {
    // position: "absolute",
    // right: 15,
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    marginLeft: 80,
    marginRight: 10,
  },
  importButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  highlightedContainer: {
    flexDirection: "row",
    width: "100%",
    flexDirection: "flex-start",
  },
  highlightedText: {
    backgroundColor: "#E7E9FD",
    padding: 10,
  },
  picker: {
    width: 200,
    marginLeft: 10,
  }
});

