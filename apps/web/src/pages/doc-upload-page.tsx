import React from "react";
import DocHeader from "../components/doc-upload/doc-header";
import DocFooter from "../components/doc-upload/doc-footer";
import DocMain from "../components/doc-upload/doc-main";
const DocUploadPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col antialiased">
      <DocHeader />
      <DocMain />
      <DocFooter />
    </div>
  );
};

export default DocUploadPage;
