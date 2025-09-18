import { newsData, newsImages, NewsItem } from '../../data/news';

describe('News Data System', () => {
  describe('NewsItem Interface', () => {
    it('應該有正確的基本欄位', () => {
      const sampleNews: NewsItem = {
        id: 'test-001',
        title: '測試標題',
        date: '2025.01.15',
        content: '測試內容',
        createdAt: '2025.01.15'
      };

      expect(sampleNews.id).toBe('test-001');
      expect(sampleNews.title).toBe('測試標題');
      expect(sampleNews.date).toBe('2025.01.15');
      expect(sampleNews.content).toBe('測試內容');
      expect(sampleNews.createdAt).toBe('2025.01.15');
    });

    it('應該支援可選的圖片欄位', () => {
      const newsWithImage: NewsItem = {
        id: 'test-002',
        title: '有圖片的新聞',
        date: '2025.01.15',
        content: '內容',
        image: 'test-image',
        createdAt: '2025.01.15'
      };

      expect(newsWithImage.image).toBe('test-image');
    });

    it('應該支援可選的 CTA 欄位', () => {
      const newsWithCTA: NewsItem = {
        id: 'test-003',
        title: '有 CTA 的新聞',
        date: '2025.01.15',
        content: '內容',
        ctaText: '了解更多',
        ctaLink: 'https://example.com',
        createdAt: '2025.01.15'
      };

      expect(newsWithCTA.ctaText).toBe('了解更多');
      expect(newsWithCTA.ctaLink).toBe('https://example.com');
    });
  });

  describe('newsData Array', () => {
    it('應該是一個非空陣列', () => {
      expect(Array.isArray(newsData)).toBe(true);
      expect(newsData.length).toBeGreaterThan(0);
    });

    it('每個新聞項目都應該有必要的欄位', () => {
      newsData.forEach(news => {
        expect(news.id).toBeTruthy();
        expect(typeof news.id).toBe('string');
        expect(news.title).toBeTruthy();
        expect(typeof news.title).toBe('string');
        expect(news.date).toBeTruthy();
        expect(typeof news.date).toBe('string');
        expect(news.content).toBeTruthy();
        expect(typeof news.content).toBe('string');
        expect(news.createdAt).toBeTruthy();
        expect(typeof news.createdAt).toBe('string');
      });
    });

    it('每個新聞項目的 ID 應該是唯一的', () => {
      const ids = newsData.map(news => news.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('應該按照日期排序（最新在前）', () => {
      for (let i = 0; i < newsData.length - 1; i++) {
        const currentDate = new Date(newsData[i].createdAt.replace(/\./g, '-'));
        const nextDate = new Date(newsData[i + 1].createdAt.replace(/\./g, '-'));
        expect(currentDate >= nextDate).toBe(true);
      }
    });

    it('應該包含預期的新聞項目', () => {
      const expectedNewsIds = ['n001', 'n002', 'n003', 'n004', 'n005'];
      const actualIds = newsData.map(news => news.id);
      
      expectedNewsIds.forEach(id => {
        expect(actualIds).toContain(id);
      });
    });

    it('應該有正確的新聞標題', () => {
      const n001 = newsData.find(news => news.id === 'n001');
      const n005 = newsData.find(news => news.id === 'n005');

      expect(n001?.title).toBe('🎉 Localite正式上線！全新導覽體驗等你來探索');
      expect(n005?.title).toBe('【忠寮專屬】限定版AI導覽員出沒，立即登入收藏他！');
    });

    it('n002 應該包含 CTA 資訊', () => {
      const n002 = newsData.find(news => news.id === 'n002');
      
      expect(n002?.ctaText).toBe('了解更多');
      expect(n002?.ctaLink).toBe('https://localite.ai/news');
    });
  });

  describe('newsImages Object', () => {
    it('應該是一個物件', () => {
      expect(typeof newsImages).toBe('object');
      expect(newsImages).not.toBeNull();
    });

    it('應該為每個有圖片的新聞項目提供對應的圖片資源', () => {
      newsData.forEach(news => {
        if (news.image) {
          expect(newsImages[news.image]).toBeDefined();
          expect(typeof newsImages[news.image]).toBe('string'); // Jest 環境中 require() 回傳字串
        }
      });
    });

    it('應該包含所有預期的圖片資源', () => {
      const expectedImages = ['n001', 'n002', 'n003', 'n004', 'n005'];
      
      expectedImages.forEach(imageKey => {
        expect(newsImages[imageKey]).toBeDefined();
      });
    });

    it('每個圖片資源都應該有效', () => {
      Object.values(newsImages).forEach(imageResource => {
        expect(imageResource).toBeDefined();
        // Jest 環境中 require() 回傳字串類型的資源路徑
        expect(typeof imageResource).toBe('string');
      });
    });
  });

  describe('資料一致性檢查', () => {
    it('有 image 欄位的新聞都應該有對應的圖片資源', () => {
      newsData.forEach(news => {
        if (news.image) {
          expect(newsImages[news.image]).toBeDefined();
        }
      });
    });

    it('圖片資源中不應該有多餘的資源', () => {
      const usedImageIds = newsData
        .filter(news => news.image)
        .map(news => news.image);
      
      Object.keys(newsImages).forEach(imageKey => {
        expect(usedImageIds).toContain(imageKey);
      });
    });

    it('日期格式應該一致', () => {
      const dateRegex = /^\d{4}\.\d{2}\.\d{2}$/;
      
      newsData.forEach(news => {
        expect(news.date).toMatch(dateRegex);
        expect(news.createdAt).toMatch(dateRegex);
      });
    });

    it('CTA 資訊應該成對出現', () => {
      newsData.forEach(news => {
        if (news.ctaText || news.ctaLink) {
          // 如果有 CTA 文字或連結，兩者都應該存在
          expect(news.ctaText).toBeTruthy();
          expect(news.ctaLink).toBeTruthy();
          expect(news.ctaLink).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  describe('輔助函數', () => {
    it('應該能夠根據 ID 查找新聞', () => {
      const getNewsById = (id: string): NewsItem | undefined => {
        return newsData.find(news => news.id === id);
      };

      const news = getNewsById('n001');
      expect(news).toBeTruthy();
      expect(news?.id).toBe('n001');

      const nonExistentNews = getNewsById('n999');
      expect(nonExistentNews).toBeUndefined();
    });

    it('應該能夠獲取最新的新聞', () => {
      const getLatestNews = (count: number = 3): NewsItem[] => {
        return newsData.slice(0, count);
      };

      const latestThree = getLatestNews(3);
      expect(latestThree.length).toBe(3);
      expect(latestThree[0].id).toBe('n005'); // 最新的
      expect(latestThree[1].id).toBe('n004');
      expect(latestThree[2].id).toBe('n003');
    });

    it('應該能夠過濾有圖片的新聞', () => {
      const getNewsWithImages = (): NewsItem[] => {
        return newsData.filter(news => news.image);
      };

      const newsWithImages = getNewsWithImages();
      expect(newsWithImages.length).toBeGreaterThan(0);
      
      newsWithImages.forEach(news => {
        expect(news.image).toBeTruthy();
        expect(newsImages[news.image!]).toBeDefined();
      });
    });

    it('應該能夠過濾有 CTA 的新聞', () => {
      const getNewsWithCTA = (): NewsItem[] => {
        return newsData.filter(news => news.ctaText && news.ctaLink);
      };

      const newsWithCTA = getNewsWithCTA();
      
      newsWithCTA.forEach(news => {
        expect(news.ctaText).toBeTruthy();
        expect(news.ctaLink).toBeTruthy();
      });
    });
  });
});
