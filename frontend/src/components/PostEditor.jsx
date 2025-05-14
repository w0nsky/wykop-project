import React, { useState } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";

export default function PostEditor({ initialContent = "", onChange, content }) {
  const [value, setValue] = useState(initialContent);
  const [selectedTab, setSelectedTab] = useState("write");
  content && setValue(content);

  // Konwerter Markdown → HTML dla podglądu
  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  // Przy każdej zmianie wysyłamy raw markdown w callbacku
  const handleValueChange = (md) => {
    setValue(md);
    onChange(md);
  };

  return (
    <div className="my-4">
      <ReactMde
        value={value}
        onChange={handleValueChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
      />
    </div>
  );
}
