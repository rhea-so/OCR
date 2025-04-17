document.addEventListener('DOMContentLoaded', () => {
    // 필요한 DOM 요소
    const imageUpload = document.getElementById('image-upload');
    const previewImage = document.getElementById('preview-image');
    const processBtn = document.getElementById('process-btn');
    const resultText = document.getElementById('result-text');
    const copyBtn = document.getElementById('copy-btn');
    const loader = document.getElementById('loader');
    
    // 이미지 업로드 및 미리보기
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                processBtn.disabled = false;
                resultText.textContent = '';
                copyBtn.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // OCR 처리 시작
    processBtn.addEventListener('click', () => {
        // 로딩 표시
        loader.style.display = 'block';
        processBtn.disabled = true;
        resultText.textContent = '처리 중...';
        
        // 다중 언어 설정 - 주요 언어들을 명시적으로 지정
        const language = 'kor+eng+jpn+chi_sim+chi_tra+ara+heb+ben+hin+tha+tel+tam+mar+rus+aze+tur+vie+deu+fra+ita+spa+por';
        
        // 초기 메시지 표시
        resultText.textContent = '여러 언어 OCR 모델 로딩 중... 처음 사용 시 시간이 걸릴 수 있습니다';
        
        // Tesseract.js를 사용하여 OCR 처리 시작
        Tesseract.recognize(
            previewImage.src,
            language,
            { 
                logger: message => {
                    if (message.status === 'recognizing text') {
                        resultText.textContent = `인식 진행 중: ${Math.floor(message.progress * 100)}%`;
                    }
                }
            }
        )
        .then(({ data: { text } }) => {
            resultText.textContent = text || '인식된 텍스트가 없습니다.';
            copyBtn.style.display = 'inline-block';
            loader.style.display = 'none';
            processBtn.disabled = false;
        })
        .catch(error => {
            resultText.textContent = `오류가 발생했습니다: ${error.message}`;
            loader.style.display = 'none';
            processBtn.disabled = false;
        });
    });
    
    // 텍스트 복사 기능
    copyBtn.addEventListener('click', () => {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = resultText.textContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        
        try {
            const successful = document.execCommand('copy');
            const message = successful ? 
                '텍스트가 클립보드에 복사되었습니다!' : 
                '복사할 수 없습니다.';
            
            alert(message);
        } catch (err) {
            alert('복사 중 오류가 발생했습니다.');
        }
        
        document.body.removeChild(tempTextArea);
    });

    // 최신 브라우저의 복사 API 사용 (fallback 방식)
    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.error('클립보드 API 오류:', error);
                return false;
            }
        }
        return false;
    }
});