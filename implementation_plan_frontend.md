# Homepage Restructuring Implementation Plan

मी तुझ्या `Tractor_Dost_BACKEND` मधील `schema.prisma` फाईल आणि `Tractor_Dost_Client` मधील पूर्ण प्रोजेक्ट स्ट्रक्चरचे अत्यंत बारकाईने **Deep Analysis** केले आहे.

बॅकएंडमधील Enums (`LeadType`, `DealerType`, `LoanType`, `DriveType`, `ListingStatus` इत्यादी) बघून मला समजले की हा फक्त एक साधा प्रोजेक्ट नसून **Tractors, Implements, Used Marketplace, Loans (Finance), आणि Dealer Network** चा एक महाकाय ई-कॉमर्स/मार्केटप्लेस प्लॅटफॉर्म आहे.

त्यामुळे, सध्याच्या होमपेजवरील डमी कार्ड्स काढून टाकून, **TractorDost च्या खऱ्या बिझनेस मॉडेलनुसार** होमपेज (Landing Page) डिझाईन करण्यासाठी मी खालील प्लॅन बनवला आहे.

## ⚠️ User Review Required

मी खालील बदल करणार आहे. हे बदल पूर्णपणे नवीन Spatial UI आणि तुझ्या Brand Colors (Green & Orange) मध्येच असतील. कृपया वाचून मला **Approve** कर.

## Proposed Changes

### 1. Main Hero & Search Dashboard (`src/app/page.tsx`)

- सर्वात वरती एक भव्य **Spatial Panel** असेल ज्यामध्ये युजर ट्रॅक्टर शोधू शकेल (Search by Brand, Budget, HP).
- यामध्ये Quick Actions असतील: Buy New, Buy Used, Sell Tractor, Apply for Loan.

### 2. Featured New Tractors Grid

- बॅकएंडच्या डेटा मॉडेलनुसार (HP, DriveType - 2WD/4WD, Price) काही लोकप्रिय ट्रॅक्टर्सची (उदा. Mahindra 575, Swaraj 744, John Deere) सुंदर `spatial-card` मध्ये लिस्टिंग.
- कार्डवर ट्रॅक्टरचे स्पेसिफिकेशन्स आणि "Get On-Road Price" चे बटण असेल.

### 3. Services & Finance Widget (Loan & EMI)

- `schema.prisma` मध्ये `LoanType` आणि `LoanApplicationStatus` आहेत, याचा अर्थ फायनान्स हा एक मोठा भाग आहे.
- होमपेजवर एक खास **EMI / Finance Widget** बनवू, ज्यामध्ये बँकांचे Interest Rates आणि "Calculate EMI" चा ऑप्शन असेल (Clima च्या humidity/UV विजेटसारखे).

### 4. Used Tractor & Dealer Network Sidebar

- उजव्या बाजूला (किंवा खाली) एक Spatial Sidebar असेल ज्यामध्ये **"Top Used Tractors"** आणि **"Verified Dealers Near You"** (उदा. Maharashtra, Punjab मधील डीलर्स) दाखवले जातील.

## Verification Plan

हे पूर्ण झाल्यावर होमपेज अगदी एखाद्या **Premium Auto Marketplace (उदा. CarDekho / Spinny च्या लेव्हलचे)** दिसेल, पण त्याची डिझाईन Apple Vision Pro च्या 3D Spatial UI सारखी असेल!

**जर तुला हा प्लॅन मान्य असेल, तर कृपया "Approve" किंवा "Proceed" असा रिप्लाय दे. त्यानंतर मी लगेचच हे रियल होमपेज डेव्हलप करायला सुरुवात करेन!**
