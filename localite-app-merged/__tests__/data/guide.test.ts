import { GUIDES, Guide } from '../../data/guide';

describe('Guide System', () => {
  describe('Guide Interface', () => {
    it('應該有正確的必要欄位', () => {
      const sampleGuide: Guide = {
        id: 'test-guide',
        id_no: 'g99',
        name: '測試導覽員',
        image: 'test-image',
        description: '測試描述'
      };

      expect(sampleGuide.id).toBe('test-guide');
      expect(sampleGuide.id_no).toBe('g99');
      expect(sampleGuide.name).toBe('測試導覽員');
      expect(sampleGuide.image).toBe('test-image');
      expect(sampleGuide.description).toBe('測試描述');
    });

    it('應該支援可選的 limitedPlaces 欄位', () => {
      const guideWithLimitedPlaces: Guide = {
        id: 'limited-guide',
        id_no: 'g98',
        name: '限定導覽員',
        image: 'test-image',
        description: '只在特定地點出現',
        limitedPlaces: ['p01', 'p02']
      };

      expect(guideWithLimitedPlaces.limitedPlaces).toEqual(['p01', 'p02']);
    });
  });

  describe('GUIDES Array', () => {
    it('應該是一個非空陣列', () => {
      console.log('Debug: GUIDES.length =', GUIDES.length);
      console.log('Debug: GUIDES =', GUIDES.map(g => ({ id: g.id, name: g.name })));
      expect(Array.isArray(GUIDES)).toBe(true);
      expect(GUIDES.length).toBeGreaterThan(0);
    });

    it('每個導覽員都應該有必要的欄位', () => {
      GUIDES.forEach(guide => {
        expect(guide.id).toBeTruthy();
        expect(typeof guide.id).toBe('string');
        expect(guide.id_no).toBeTruthy();
        expect(typeof guide.id_no).toBe('string');
        expect(guide.name).toBeTruthy();
        expect(typeof guide.name).toBe('string');
        expect(guide.image).toBeTruthy();
        expect(guide.description).toBeTruthy();
        expect(typeof guide.description).toBe('string');
      });
    });

    it('每個導覽員的 ID 應該是唯一的', () => {
      const ids = GUIDES.map(guide => guide.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('每個導覽員的編號應該是唯一的', () => {
      const idNumbers = GUIDES.map(guide => guide.id_no);
      const uniqueIdNumbers = [...new Set(idNumbers)];
      expect(idNumbers.length).toBe(uniqueIdNumbers.length);
    });

    it('應該包含基本的四位導覽員', () => {
      const basicGuideIds = ['kuron', 'pururu', 'popo', 'nikko'];
      const actualIds = GUIDES.map(guide => guide.id);
      
      basicGuideIds.forEach(id => {
        expect(actualIds).toContain(id);
      });
    });

    it('應該包含 Babyron 導覽員', () => {
      const babyronGuide = GUIDES.find(guide => guide.id === 'babyron');
      
      expect(babyronGuide).toBeTruthy();
      expect(babyronGuide?.name).toBe('BABYRON');
      expect(babyronGuide?.id_no).toBe('g06');
    });

    it('小豬忠忠應該有限定地點', () => {
      const pigletGuide = GUIDES.find(guide => guide.id === 'piglet');
      
      expect(pigletGuide).toBeTruthy();
      expect(pigletGuide?.limitedPlaces).toBeTruthy();
      expect(Array.isArray(pigletGuide?.limitedPlaces)).toBe(true);
    });

    it('Babyron 應該是一般導覽員（無地點限制）', () => {
      const babyronGuide = GUIDES.find(guide => guide.id === 'babyron');
      
      expect(babyronGuide).toBeTruthy();
      expect(babyronGuide?.limitedPlaces).toBeUndefined();
    });
  });

  describe('導覽員圖片資源', () => {
    it('每個導覽員都應該有有效的圖片資源', () => {
      GUIDES.forEach(guide => {
        expect(guide.image).toBeDefined();
        // 在測試環境中，require() 返回字串
        expect(typeof guide.image).toBe('string');
      });
    });
  });

  describe('導覽員查詢功能', () => {
    it('應該能夠根據 ID 查找導覽員', () => {
      const getGuideById = (id: string): Guide | undefined => {
        return GUIDES.find(guide => guide.id === id);
      };

      const kuronGuide = getGuideById('kuron');
      expect(kuronGuide).toBeTruthy();
      expect(kuronGuide?.name).toBe('KURON');

      const nonExistentGuide = getGuideById('non-existent');
      expect(nonExistentGuide).toBeUndefined();
    });

    it('應該能夠根據編號查找導覽員', () => {
      const getGuideByIdNo = (idNo: string): Guide | undefined => {
        return GUIDES.find(guide => guide.id_no === idNo);
      };

      const guide01 = getGuideByIdNo('g01');
      expect(guide01).toBeTruthy();
      expect(guide01?.id).toBe('kuron');
    });

    it('應該能夠獲取一般導覽員（無地點限制）', () => {
      const getGeneralGuides = (): Guide[] => {
        return GUIDES.filter(guide => !guide.limitedPlaces);
      };

      const generalGuides = getGeneralGuides();
      expect(generalGuides.length).toBeGreaterThan(0);
      
      // Babyron 應該在一般導覽員中
      const babyronInGeneral = generalGuides.find(guide => guide.id === 'babyron');
      expect(babyronInGeneral).toBeTruthy();
    });

    it('應該能夠獲取特定地點的導覽員', () => {
      const getGuidesForPlace = (placeId: string): Guide[] => {
        return GUIDES.filter(guide => 
          !guide.limitedPlaces || guide.limitedPlaces.includes(placeId)
        );
      };

      // 測試忠寮地點的導覽員
      const guidesForP03 = getGuidesForPlace('p03');
      expect(guidesForP03.length).toBeGreaterThan(0);
      
      // 小豬忠忠應該在其中
      const pigletInP03 = guidesForP03.find(guide => guide.id === 'piglet');
      expect(pigletInP03).toBeTruthy();
      
      // 一般導覽員也應該能在任何地點出現
      const babyronInP03 = guidesForP03.find(guide => guide.id === 'babyron');
      expect(babyronInP03).toBeTruthy();
    });

    it('應該能夠獲取限定導覽員', () => {
      const getLimitedGuides = (): Guide[] => {
        return GUIDES.filter(guide => guide.limitedPlaces && guide.limitedPlaces.length > 0);
      };

      const limitedGuides = getLimitedGuides();
      expect(limitedGuides.length).toBeGreaterThan(0);
      
      // 小豬忠忠應該在限定導覽員中
      const pigletInLimited = limitedGuides.find(guide => guide.id === 'piglet');
      expect(pigletInLimited).toBeTruthy();
      
      // Babyron 不應該在限定導覽員中
      const babyronInLimited = limitedGuides.find(guide => guide.id === 'babyron');
      expect(babyronInLimited).toBeFalsy();
    });
  });

  describe('導覽員描述內容', () => {
    it('每個導覽員都應該有個性化描述', () => {
      GUIDES.forEach(guide => {
        expect(guide.description.length).toBeGreaterThan(10);
        expect(guide.description).toMatch(/[擅長|溫和|害羞|急驚風|慢悠悠|甜蜜|個性]/);
      });
    });

    it('Babyron 應該有適當的描述', () => {
      const babyronGuide = GUIDES.find(guide => guide.id === 'babyron');
      
      expect(babyronGuide?.description).toBeTruthy();
      expect(babyronGuide?.description.length).toBeGreaterThan(10);
      // Babyron 的描述應該提到其特色
      expect(babyronGuide?.description).toMatch(/綠芽|初登場|限定/);
    });
  });

  describe('導覽員數量檢查', () => {
    it('應該有至少 6 位導覽員（包含 Babyron）', () => {
      expect(GUIDES.length).toBeGreaterThanOrEqual(6);
    });

    it('應該包含所有預期的導覽員', () => {
      const expectedGuides = [
        'kuron', 'pururu', 'popo', 'nikko', 'piglet', 'babyron'
      ];
      const actualIds = GUIDES.map(guide => guide.id);
      
      expectedGuides.forEach(expectedId => {
        expect(actualIds).toContain(expectedId);
      });
    });
  });
});
