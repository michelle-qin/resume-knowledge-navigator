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
  const [tocLoading, setTocLoading] = useState(false);

  const fileInputRef = useRef(null);
  // const fileInputRefs = useRef(Array.from({ length: numberOfFileInputs }, () => createRef()));


  const data = {
    "basic_info": {
      "email": "",
      "first_name": "Marianne",
      "github": "",
      "last_name": "Elbertson",
      "linkedin": "",
      "phone": "",
      "website": ""
    },
    "education": [
      {
        "degree": "Graduate Certificate",
        "description": "Washington Representatives Program",
        "end_date": "1994",
        "institution": "George Washington University",
        "start_date": "",
        "tags": []
      },
      {
        "degree": "Bachelor of Arts",
        "description": "Radio/Television/Film Production",
        "end_date": "1986",
        "institution": "University of Maryland",
        "start_date": "",
        "tags": []
      }
    ],
    "hobbies": [
      "Member of the Daughters of the American Revolution",
      "Member of the Colonial Dames 17th Century Society",
      "Former President of the Mount Vernon Terrace Community Association"
    ],
    "languages": [],
    "references": [],
    "skills": [
      "Self starter",
      "Effective strategic planning",
      "Strong leadership skills",
      "Excellent relationship building skills",
      "Resourceful and persistent"
    ],
    "summary": "Experience as public relations professional, strategist, analyst, and publicist...",
    "tags": [],
    "work_experience": [
      {
        "company": "Company Name",
        "description": "Serve as Subject Matter Expert and...",
        "end_date": "Current",
        "position": "Senior Food Defense Analyst",
        "start_date": "Dec 2003"
      },
      {
        "company": "Company Name",
        "description": "Conducted public relation activities...",
        "end_date": "Nov 2003",
        "position": "Public Affairs Specialist",
        "start_date": "Jan 2000"
      },
      {
        "company": "Company Name",
        "description": "Assisted Director and Manager...",
        "end_date": "Dec 1999",
        "position": "Government Relations Associate",
        "start_date": "Jan 1995"
      },
      {
        "company": "Company Name",
        "description": "Effectively responded to media inquiries...",
        "end_date": "Apr 1994",
        "position": "Public Affairs Specialist",
        "start_date": "Jan 1990"
      },
      {
        "company": "Company Name",
        "description": "Researched and pitched story ideas...",
        "end_date": "Mar 1989",
        "position": "Assistant Publicist",
        "start_date": "Aug 1987"
      },
      {
        "company": "Company Name",
        "description": "Prepared documents for purchasers...",
        "end_date": "Aug 1987",
        "position": "Administrative Assistant",
        "start_date": "Jul 1986"
      }
    ]
  }
  const [toc, setToc] = useState(null);

  const toc_request = async () => {

    try {

      setTocLoading(true);
      const response = await fetch('http://127.0.0.1:5000/get_toc', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "doc_id": currentDocID
        })
      }).then(async (response) => {
        const data = await response.json();
        console.log(data)
        setToc(data.properties ? data.properties : data);
        setTocLoading(false);

      }

      )

    } catch (error) {
      console.error(error);
      setTocLoading(false);
    }

  }

  useEffect(() => {
    if (currentDocID) {
      toc_request();
    }
  }, [currentDocID])

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
          const messageResponseJson = await response.json();
          console.log(messageResponseJson.TOC)
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
          {tocLoading ? (<Text>Table of Contents Loading...</Text>) : (<ToC style={styles.toc} data={toc} doc_id={currentDocID} />)}
        </View>
        {/* View Column */}
        <View style={[styles.column, styles.viewColumn]}>
          <View style={styles.titleContainer}>
            <Picker
              style={styles.picker}
              selectedValue={currentDocName}
              onValueChange={(itemValue, itemIndex) => {
                const selectedFile = uploadedFiles.find((file) => file.name === itemValue);
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

