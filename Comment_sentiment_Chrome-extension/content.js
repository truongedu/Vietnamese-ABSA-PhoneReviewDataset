/**
 * File này được tiêm vào trang web tự động.
 * (Bản v5.1 - Sửa lỗi Selector & iFrame)
 */
(function() {
  console.log("Comment Analyzer (ABSA) ĐÃ KHỞI ĐỘNG (v5.1)");

  // --- CẤU HÌNH SELECTOR (MỚI) ---
  // Định nghĩa selector cho các trang khác nhau
  // Cập nhật: Trỏ chính xác vào thẻ <p> chứa text để tránh bị nhiễu
  const SELECTORS = {
    'thegioididong.com': '.comment-item__content p.cmt-txt',
    'dienmayxanh.com': '.comment-item__content p.cmt-txt',
    'fptshop.com.vn': '.card-comment-item-content-text',
    'test_page': '.comment-text' // Selector cho test-page.html
  };

  // Hàm chọn selector dựa trên URL hiện tại
  function getCommentSelector() {
    const host = window.location.hostname;
    
    if (host.includes('thegioididong.com')) {
      return SELECTORS['thegioididong.com'];
    }
    if (host.includes('dienmayxanh.com')) {
      return SELECTORS['dienmayxanh.com'];
    }
    if (host.includes('fptshop.com.vn')) {
      return SELECTORS['fptshop.com.vn'];
    }
    if (window.location.protocol === 'file:') {
      console.log("Đã phát hiện Trang Test, sử dụng selector: ", SELECTORS['test_page']);
      return SELECTORS['test_page'];
    }
    
    console.warn("Comment Analyzer: Không nhận diện được trang web. Extension có thể không hoạt động.");
    return null; // Trả về null nếu không khớp trang nào
  }

  const COMMENT_SELECTOR = getCommentSelector();
  
  if (COMMENT_SELECTOR) {
    console.log(`Comment Analyzer: Sử dụng selector [${COMMENT_SELECTOR}] cho trang [${window.location.hostname}]`);
  } else {
    console.log("Comment Analyzer: Không tìm thấy selector phù hợp, extension sẽ không chạy.");
    return; // Dừng script nếu không có selector
  }
  // ------------------------

  const API_ENDPOINT = 'https://localhost:9753/analyze'; // Địa chỉ server MỚI
  let analysisTimeout; 

  // --- LOGIC PHÂN TÍCH (ĐÃ CẬP NHẬT) ---
  async function analyzeNewComments() {
    console.log("Comment Analyzer: Đang quét tìm comment mới với selector:", COMMENT_SELECTOR);
    
    const textElements = document.querySelectorAll(COMMENT_SELECTOR);
    let newCommentsFound = 0;

    for (const commentContainer of textElements) {
      
      // Bỏ qua nếu đã phân tích (kiểm tra dataset)
      if (commentContainer.dataset.analyzed === 'true') {
        continue;
      }

      // Đánh dấu là "đã xử lý" NGAY LẬP TỨC để tránh gọi lại
      commentContainer.dataset.analyzed = 'true';
      newCommentsFound++;

      const commentText = commentContainer.textContent;
      if (!commentText || !commentText.trim()) {
        console.log("Comment Analyzer: Bỏ qua comment rỗng.");
        continue; // Bỏ qua nếu comment rỗng
      }

      console.log("Comment Analyzer: Đã tìm thấy text, đang gửi tới server:", commentText.substring(0, 50) + "...");

      try {
        // --- Gọi API ---
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: commentText })
        });

        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const analysis = await response.json(); // Mong đợi { aspects: [...] }
        
        // --- LOGIC HIỂN THỊ (MỚI) ---
        // Kiểm tra xem server có trả về aspect nào không
        if (analysis.aspects && analysis.aspects.length > 0) {
          
          // Tạo một container (ghi chú) để chứa các tag/pill
          const aspectContainer = document.createElement('div');
          aspectContainer.style.marginTop = '8px';
          aspectContainer.style.display = 'flex'; // Hiển thị các tag trên cùng 1 hàng
          aspectContainer.style.flexWrap = 'wrap'; // Cho phép xuống hàng nếu hết chỗ
          aspectContainer.style.gap = '6px'; // Khoảng cách giữa các tag

          // Lặp qua từng aspect server trả về
          for (const item of analysis.aspects) {
            const aspectTag = document.createElement('span');
            
            // Nội dung tag: "Tên Aspect: Nhãn Polarity" (vd: "Pin: Tiêu cực")
            aspectTag.textContent = `${item.aspect}: ${item.label}`;
            
            // Style cho tag (pill)
            aspectTag.style.backgroundColor = item.color; // Dùng màu từ server
            aspectTag.style.color = 'white';
            aspectTag.style.padding = '3px 8px';
            aspectTag.style.borderRadius = '12px';
            aspectTag.style.fontSize = '11px';
            aspectTag.style.fontWeight = '500';
            aspectTag.style.display = 'inline-block';
            
            aspectContainer.appendChild(aspectTag);
          }
          
          // Chèn container chứa các tag vào SAU phần tử comment
          commentContainer.insertAdjacentElement('afterend', aspectContainer);
        }
        // -----------------------------

      } catch (error) {
        console.error("Lỗi khi gọi API phân tích:", error);
        // Gắn nhãn lỗi (có thể giữ lại nếu muốn)
        const errorLabel = document.createElement('span');
        errorLabel.textContent = ` [Lỗi phân tích]`;
        errorLabel.style.color = 'red';
        errorLabel.style.marginLeft = '10px';
        errorLabel.style.fontSize = '12px';
        commentContainer.insertAdjacentElement('afterend', errorLabel);
      }
    }
    // ------------------------

    if (newCommentsFound > 0) {
      console.log(`Comment Analyzer: Đã xử lý ${newCommentsFound} comment mới.`);
    }
  }

  // --- LOGIC MUTATION OBSERVER (Giữ nguyên) ---
  // Theo dõi sự thay đổi của trang (ví dụ: khi nhấn "Xem thêm bình luận")
  const observerCallback = (mutationsList, observer) => {
    let changed = false;
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Chỉ quét lại nếu có node mới được thêm vào
        // (Tránh trường hợp tự trigger khi chúng ta thêm tag)
        let containsCommentNode = false;
        mutation.addedNodes.forEach(node => {
          // Kiểm tra xem node mới có phải là comment hoặc chứa comment không
          if (node.nodeType === 1 && (node.matches(COMMENT_SELECTOR) || node.querySelector(COMMENT_SELECTOR))) {
            containsCommentNode = true;
          }
        });
        
        if(containsCommentNode) {
          changed = true;
        }
      }
    }

    if (changed) {
      // Dùng setTimeout để tránh quét quá nhiều lần liên tục
      clearTimeout(analysisTimeout);
      analysisTimeout = setTimeout(() => {
        analyzeNewComments(); // Gọi hàm async
      }, 1000); // Tăng thời gian chờ lên 1s
    }
  };

  const observer = new MutationObserver(observerCallback);

  // Bắt đầu theo dõi toàn bộ body của trang
  observer.observe(document.body, {
    childList: true, // Theo dõi thêm/xóa node con
    subtree: true    // Theo dõi toàn bộ cây DOM
  });

  // Chạy lần đầu tiên khi tải trang
  // Tăng thời gian chờ lên 3s để cho các comment AJAX có thời gian tải
  setTimeout(analyzeNewComments, 3000); 
})();