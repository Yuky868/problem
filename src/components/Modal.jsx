import { useState } from "react";
import { Button, Modal, Form, Radio, Input } from "antd";
import {numType, choiceType, answerType, analyseType, explainType, subNumType, subExplainType, detailType} from '../utils/enum'
const App = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [analyCustom, setAnalyCustom] = useState('')
  const [explainCustom, setExplainCustom] = useState('')
  const [detailCustom, setDetailCustom] = useState('')
  const showModal = () => {
    setIsModalOpen(true);
  };

  const changInputAnaly = (e) => {
    setAnalyCustom(e.target.value)
  }

  const changInputExplain = (e) => {
    setExplainCustom(e.target.value)
  }
  const changInputAnaDetail = (e) => {
    setDetailCustom(e.target.value)
  }
  const handleOk = () => {
    form.validateFields().then((values) => {
      const problemNumType = numType[values.problemId]
      const problemChoiceType = choiceType[values.choiceType]
      const problemAnswerType = answerType[values.answerType]
      const problemAnalyseType = analyseType[values.analyseType] || new RegExp(values.analyseType, 'g')
      const problemExplainType = explainType[values.explainType] || new RegExp(values.explainType, 'g')
      const problemDetailType = detailType[values.detailType] || new RegExp(values.detailType, 'g')
      const problemSubNumType = subNumType[values.subNumType]
      const problemSubExplainType = subExplainType[values.subExplainType]
      console.log('Received values of form: ', {problemNumType, problemChoiceType, problemAnswerType, problemAnalyseType, problemExplainType, problemSubNumType, problemSubExplainType, problemDetailType});
      onOk({problemNumType, problemChoiceType, problemAnswerType, problemAnalyseType, problemExplainType, problemSubNumType, problemSubExplainType, problemDetailType})
    });
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button type="primary" onClick={showModal}>
        将文档拆分为习题
      </Button>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item label="题号" name='problemId'>
            <Radio.Group>
              <Radio value={1}>1.</Radio>
              <Radio value={2}>第1题</Radio>
              <Radio value={3}>1)</Radio>
              <Radio value={4}>1）</Radio>
              <Radio value={5}>1</Radio>
              <Radio value={6}>（1）</Radio>
              <Radio value={7}>(1)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="选项" name='choiceType'>
            <Radio.Group>
              <Radio value={1}>A.</Radio>
              <Radio value={2}>A)</Radio>
              <Radio value={3}>a.</Radio>
              <Radio value={4}>(A)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="答案" name='answerType'>
            <Radio.Group>
              <Radio value={1}>[答案]</Radio>
              <Radio value={2}>【答案】</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="分析" name='analyseType'>
            <Radio.Group>
              <Radio value={1}>[分析]</Radio>
              <Radio value={2}>【分析】</Radio>
              <Radio value={analyCustom}><Input value={analyCustom} onChange={changInputAnaly}/></Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="解析" name='explainType'>
            <Radio.Group>
              <Radio value={1}>[解析]</Radio>
              <Radio value={2}>【解析】</Radio>
              <Radio value={explainCustom}><Input value={explainCustom} onChange={changInputExplain}/></Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="详解" name='detailType'>
            <Radio.Group>
              <Radio value={1}>[详解]</Radio>
              <Radio value={2}>【详解】</Radio>
              <Radio value={detailCustom}><Input value={detailCustom} onChange={changInputAnaDetail}/></Radio>
            </Radio.Group>
          </Form.Item>
          {/* <Form.Item label="小问序号" name='subNumType'>
            <Radio.Group>
                <Radio value={1}>（1）</Radio>
              <Radio value={2}>(1)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="小问解析" name='subExplainType'>
            <Radio.Group>
                <Radio value={1}>【小问1解析】</Radio>
                <Radio value={2}>【小问1详解】</Radio>
            </Radio.Group>
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
};
export default App;
