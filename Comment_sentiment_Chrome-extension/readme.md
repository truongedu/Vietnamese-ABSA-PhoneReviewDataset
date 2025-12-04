## Chỉnh sửa content 
tại file content.js dòng 23:
```javascript
const API_ENDPOINT = 'http://localhost:3000/analyze'; // Địa chỉ server
```  
Có thể điều chỉnh logic ẩn nếu bình luận tiêu cực dòng 74: 
```javascroipt
if (result.name === 'negative') {
	
	// Làm mờ tất cả các `div[dir="auto"]` bên trong (cho Facebook)
	commentContainer.querySelectorAll('div[dir="auto"]').forEach(el => {
		el.style.filter = 'blur(5px)';
		el.style.transition = 'filter 0.3s';
	});

	// Logic làm mờ cho test-page (vì nó không có div[dir="auto"])
	if (isTestPage) {
		textElement.style.filter = 'blur(5px)';
		textElement.style.transition = 'filter 0.3s';
	}
	
}
```


## Chỉnh sửa manifest
tại file manifest.json dòng 9: 
```json
"http://localhost:3000/*"
```  


## Chỉnh sửa server 
logic trong server.py dòng 44:
```python
#============LOGIC: PHÂN TÍCH SENTIMENT=============
if not text.strip():
		# Nếu text rỗng hoặc chỉ có khoảng trắng, coi là trung tính
		sentiment_name = 'neutral'
else:
		sentiment_name = uts_sentiment(text)
#===================================================
``` 