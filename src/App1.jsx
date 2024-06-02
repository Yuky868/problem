// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from 'react'
import * as mammoth from 'mammoth';
import { Space, Row, Col, Button } from 'antd'
import { Editor, EditorState, convertToRaw } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import draftToHtml from 'draftjs-to-html'
import 'draft-js/dist/Draft.css';
import './App.css'

function App() {
  const [file, setFile] = useState(null); // 文件信息
  const [content, setContent] = useState('');
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty()); // 富文本

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const htmlToDraftContentState = (html) => {
    const contentState = stateFromHTML(html);
    return contentState;
  };

  const loadWordContent = (html) => {
    if (html) {
      const contentState = htmlToDraftContentState(html);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }

  const parseWordFile = async () => {
    if (!file) {
      alert('请选择一个Word文件');
      return;
    }

    try {
      const fileReader = new FileReader();
      fileReader.onloadend = async (ev) => {
        const arrayBuffer = ev.target.result;
        const options = { styleMap: [
          "p[style-name^='Heading'] => p:fresh",
          "u => em.underline",
          "strike => del"
        ] }; // 自定义样式映射
        const result = await mammoth.convertToHtml({ arrayBuffer, options });
        setContent(result.value);
        loadWordContent(result.value)
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('解析Word文件时出错:', error);
      alert('解析Word文件时出错');
    }
  };

  const changeEdit = (value) => {
    setEditorState(value)
  }

  const blurEdit = () => {
    const draftToHtmlValue =  draftToHtml(convertToRaw(editorState.getCurrentContent()))
    console.log(draftToHtmlValue);
    setContent(draftToHtmlValue);
  }

  return (
    <div>
      <Space>
        <input type="file" accept=".docx" onChange={handleFileChange} />
        <Button type='primary' onClick={parseWordFile}>解析Word文件</Button>
      </Space>
     <Row gutter={24}>
      <Col span={12}>
        <Editor 
          editorState={editorState} 
          onChange={(v) => changeEdit(v)}  
          onBlur={(v) => blurEdit(v)} 
          wrapperClassName="editor-wrapper"
          editorClassName="editor"
          placeholder="Write something!"
        />
      </Col>
      <Col span={12}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Col>
     </Row>
    </div>
  );
}

export default App
