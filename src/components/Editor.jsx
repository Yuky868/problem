import { useEffect, useRef } from "react";



// eslint-disable-next-line react/prop-types
function MyEditor({ onChange , ...props}) {
    const editorRef = useRef(null);
  
    useEffect(() => {
      if (typeof window !== 'undefined' && window.tinymce) {
        window.tinymce.init({
          selector: `#${editorRef.current.id}`,
          // language: "zh_CN",
          height: 800,
          plugins: [
            'link','image','charmap','preview','anchor','searchreplace','visualblocks',
            'fullscreen','insertdatetime','media','table','wordcount'
         ],
         toolbar: 'undo redo | bold italic | bullist numlist | link image | code',
         setup: function(editor) {
          editor.on('change', function() {
            console.log("内容发生了变化");
            const changeValue =  editor.getContent()
            console.log(changeValue);
            onChange(changeValue)
          });
        }
        });
      }
      
      return () => {
        if (typeof window !== 'undefined' && window.tinymce) {
          window.tinymce.remove(`#${editorRef.current.id}`);
        }
      };
    }, [editorRef]);
  
    return <textarea id="myEditor" ref={editorRef} {...props} />;
  }

  export default MyEditor