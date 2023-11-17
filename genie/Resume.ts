import {
  GenieKey,
  GenieClass,
  GenieFunction,
  GenieProperty,
  DataClass,
  float,
} from "reactgenie-lib";
import "reflect-metadata";

@GenieClass("A Resume class")
export class Resume extends DataClass {
  @GenieKey
  @GenieProperty()
  public id: string;
  @GenieProperty()
  public path: string;
  @GenieProperty()
  public content: string;

  constructor({ id, path, content }: { id: string; path: string; content: string }) {
    super({});
    this.id = id;
    this.path = path;
    this.content = content;
  }

  @GenieProperty()
  static Version: float = 1.0;

  static setup() {
    Resume.CreateObject({
      id: "1", path: "John_Smith_Resume.pdf", content: "John Smith\nEmail: johnsmith@stanford.edu LinkedIn: https://linkedin.com/in/john-smith\nExperience\nSoftware Engineer Google 2019-2023",
    });
  }


  @GenieFunction()
  static GetResume({ id = "" }: { id?: string }): Resume {
    return Resume.GetObject({ id: id });
  }
}

export const ResumeExamples = [
  {
    user_utterance: "current resume id",
    example_parsed: "Resume.Current().id",
  },

];
