# Mobile App - MVVM + Redux Architecture

## 📱 Tổng quan

Ứng dụng mobile được xây dựng với **MVVM (Model-View-ViewModel)** pattern kết hợp **Redux Toolkit** để tạo ra một cấu trúc code sạch, dễ bảo trì và testable.

## 🏗️ Kiến trúc

### Architecture Overview

> **📋 Hướng dẫn tạo hình vẽ kiến trúc:**
> 
> Sử dụng các công cụ sau để tạo hình vẽ chân thực:
> - **Draw.io** (diagrams.net) - Miễn phí, dễ sử dụng
> - **Lucidchart** - Chuyên nghiệp, có template sẵn
> - **Figma** - Thiết kế UI/UX, có thể vẽ diagram
> - **Miro** - Collaboration tool, nhiều template
> - **Visio** - Microsoft Office, chuyên nghiệp

#### 🎨 Cấu trúc hình vẽ đề xuất:

```
┌─────────────────────────────────────────────────────────────┐
│                    📱 MOBILE APP                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │    🎨 VIEW      │    │   🧭 NAVIGATION │                │
│  │                 │    │                 │                │
│  │ • Login Screen  │    │ • Stack Router  │                │
│  │ • Home Screen   │    │ • Tab Router    │                │
│  │ • Components    │    │ • Modal Router  │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              🧠 VIEWMODEL LAYER                         │ │
│  │                                                         │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │ │
│  │  │ AuthViewModel│    │HomeViewModel│    │BaseViewModel│  │ │
│  │  │             │    │             │    │             │  │ │
│  │  │ • login()   │    │ • loadData()│    │ • executeAsync│ │ │
│  │  │ • logout()  │    │ • refresh() │    │ • dispatch() │ │ │
│  │  │ • checkAuth()│   │ • updateUI()│    │ • getState() │ │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              🔄 REDUX LAYER                             │ │
│  │                                                         │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │ │
│  │  │  AuthSlice  │    │  HomeSlice  │    │   Store     │  │ │
│  │  │             │    │             │    │             │  │ │
│  │  │ • State     │    │ • State     │    │ • Reducers  │  │ │
│  │  │ • Actions   │    │ • Actions   │    │ • Middleware│  │ │
│  │  │ • Thunks    │    │ • Thunks    │    │ • DevTools  │  │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              📊 MODEL LAYER                             │ │
│  │                                                         │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │ │
│  │  │   Entities  │    │ Repositories│    │   Services  │  │ │
│  │  │             │    │             │    │             │  │ │
│  │  │ • User      │    │ • AuthRepo  │    │ • AuthService│ │ │
│  │  │ • Product   │    │ • UserRepo  │    │ • ApiService│ │ │
│  │  │ • Order     │    │ • DataRepo  │    │ • Storage   │ │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 🎯 Các loại hình vẽ cần tạo:

1. **📊 Architecture Diagram** - Sơ đồ kiến trúc tổng thể
2. **🔄 Data Flow Diagram** - Luồng dữ liệu
3. **📁 Folder Structure** - Cấu trúc thư mục
4. **⚡ Component Interaction** - Tương tác component
5. **🔄 State Management Flow** - Luồng quản lý state

#### 🛠️ Công cụ đề xuất cho từng loại:

| Loại hình vẽ | Công cụ đề xuất | Lý do |
|-------------|----------------|-------|
| Architecture | Draw.io, Lucidchart | Có template sẵn cho software architecture |
| Data Flow | Miro, Figma | Dễ vẽ arrows và connections |
| Folder Structure | Draw.io, Visio | Có tree diagram templates |
| Component Interaction | Figma, Miro | Tốt cho UI/UX flow |
| State Management | Lucidchart, Draw.io | Có Redux/state templates |

#### 📋 Template cho Architecture Diagram:

**Colors:**
- 🎨 View Layer: `#4CAF50` (Green)
- 🧠 ViewModel Layer: `#2196F3` (Blue)
- 🔄 Redux Layer: `#FF9800` (Orange)
- 📊 Model Layer: `#9C27B0` (Purple)

**Shapes:**
- Rectangles cho layers
- Rounded rectangles cho components
- Arrows cho data flow
- Icons cho visual appeal

**Layout:**
- Vertical flow từ top xuống bottom
- Horizontal grouping trong mỗi layer
- Clear separation giữa các layers

## 📁 Cấu trúc thư mục

### Project Structure Visualization

> **📋 Hướng dẫn tạo folder structure diagram:**
> 
> Sử dụng **Draw.io** với template "Tree Diagram" hoặc **Lucidchart** với "Org Chart" template.

```
📦 moblie/
├── 📁 app/                          # 🎨 View Layer
│   ├── 📄 _layout.tsx              # Root layout với navigation
│   ├── 📄 login.tsx                # Login screen
│   ├── 📄 modal.tsx                # Modal screen
│   └── 📁 (tabs)/                  # Tab navigation
│       ├── 📄 _layout.tsx          # Tab layout
│       ├── 📄 index.tsx            # Home screen
│       └── 📄 two.tsx              # Settings screen
│
├── 📁 viewmodels/                   # 🧠 ViewModel Layer
│   ├── 📁 shared/
│   │   └── 📄 BaseViewModel.ts     # Base ViewModel class
│   ├── 📁 auth/
│   │   └── 📄 AuthViewModel.ts     # Auth business logic
│   ├── 📁 home/
│   │   └── 📄 HomeViewModel.ts     # Home business logic
│   └── 📄 index.ts                 # Exports
│
├── 📁 features/                     # 🔄 Redux Layer
│   ├── 📁 auth/
│   │   ├── 📄 authSlice.ts         # Auth state + actions
│   │   └── 📄 authThunk.ts         # Async actions
│   └── 📁 home/
│       └── 📄 homeSlice.ts         # Home state + actions
│
├── 📁 models/                       # 📊 Model Layer
│   ├── 📁 auth/
│   │   ├── 📄 signin.ts            # SignIn interfaces
│   │   └── 📄 signup.ts            # SignUp interfaces
│   ├── 📁 generic/
│   │   ├── 📄 baseState.ts         # Base state interface
│   │   ├── 📄 genericResponse.ts   # Generic response
│   │   └── 📄 thunkOptions.ts      # Thunk options
│   └── 📁 enum/
│       └── 📄 httpMethod.ts        # HTTP methods enum
│
├── 📁 lib/                          # 🔧 Infrastructure
│   ├── 📁 redux/
│   │   ├── 📄 store.ts             # Redux store
│   │   └── 📄 hooks.ts             # Typed hooks
│   ├── 📁 axios/
│   │   └── 📄 axiosInstance.ts     # HTTP client
│   └── 📁 jwt/                     # JWT utilities
│
├── 📁 components/                   # 🧩 Shared Components
│   ├── 📄 Themed.tsx               # Themed components
│   ├── 📄 EditScreenInfo.tsx       # Reusable components
│   └── 📄 useColorScheme.ts        # Color scheme hook
│
├── 📁 constants/                    # 📋 Constants
│   └── 📄 Colors.ts                # Color definitions
│
└── 📄 package.json                  # Dependencies
```

## 🔄 Data Flow

### Data Flow Visualization

> **📋 Hướng dẫn tạo data flow diagram:**
> 
> Sử dụng **Miro** hoặc **Figma** để tạo flow diagram với:
> - Swimlanes cho mỗi layer
> - Arrows với labels cho data flow
> - Icons cho visual appeal

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    VIEW     │    │ VIEWMODEL   │    │    REDUX    │    │    MODEL    │
│             │    │             │    │             │    │             │
│ User Input  │───▶│ Business    │───▶│   Actions   │───▶│   API Call  │
│             │    │ Logic       │    │             │    │             │
│             │◀───│             │◀───│   State     │◀───│   Response  │
│ UI Update   │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### 🎯 Các bước tạo Data Flow Diagram:

1. **Tạo swimlanes** cho 4 layers chính
2. **Vẽ arrows** với direction rõ ràng
3. **Thêm labels** cho mỗi arrow
4. **Sử dụng colors** để phân biệt data types
5. **Thêm icons** cho visual appeal

## 🚀 Cách sử dụng

### 1. Tạo ViewModel mới:

```typescript
// features/user/userSlice.ts
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = action.payload;
    }
  }
});

// viewmodels/user/UserViewModel.ts
export class UserViewModel extends BaseViewModel<RootState['user']> {
  updateProfile(profile: UserProfile): void {
    this.dispatch(updateProfile(profile));
  }
}
```

### 2. Sử dụng trong component:

```typescript
// app/profile.tsx
const userSelector = (state: RootState) => state.user;
const [userState, userViewModel] = useViewModel(UserViewModel, userSelector);

const handleUpdateProfile = () => {
  userViewModel.updateProfile(newProfile);
};
```

## ✨ Tính năng chính

- 🔐 **Authentication**: Login/logout với token management
- 🏠 **Home Dashboard**: User info và welcome message
- 🔄 **State Management**: Redux Toolkit với DevTools
- 📱 **Navigation**: Expo Router với stack và tab navigation
- 🎨 **Theming**: Light/Dark mode support
- 🔧 **Type Safety**: TypeScript support đầy đủ
- 🧪 **Testable**: MVVM pattern dễ test

## 🛠️ Công nghệ sử dụng

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Expo Router** - Navigation
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd moblie

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

## 🧪 Testing

```bash
# Chạy tests
npm test

# Chạy tests với coverage
npm run test:coverage
```

## 📚 Tài liệu tham khảo

- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)

## 🎨 Hướng dẫn tạo hình vẽ

### Công cụ đề xuất:

1. **Draw.io (diagrams.net)** - Miễn phí, nhiều template
2. **Lucidchart** - Chuyên nghiệp, có Redux templates
3. **Figma** - Thiết kế UI/UX, có thể vẽ diagram
4. **Miro** - Collaboration, nhiều template
5. **Visio** - Microsoft Office, chuyên nghiệp

### Template colors cho architecture:

- 🎨 **View Layer**: `#4CAF50` (Green)
- 🧠 **ViewModel Layer**: `#2196F3` (Blue)  
- 🔄 **Redux Layer**: `#FF9800` (Orange)
- 📊 **Model Layer**: `#9C27B0` (Purple)

### Các loại diagram cần tạo:

1. **Architecture Overview** - Tổng quan kiến trúc
2. **Data Flow** - Luồng dữ liệu
3. **Folder Structure** - Cấu trúc thư mục
4. **Component Interaction** - Tương tác component
5. **State Management Flow** - Quản lý state

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.