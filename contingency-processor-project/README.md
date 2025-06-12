# Contingency File Processor

A modern web application for processing contingency files with Excel modifications, built with React, TypeScript, and Vite.

## 🚀 Features

- **Excel File Processing**: Upload and process Excel files with contingency modifications
- **Base File Management**: Support for .con contingency files
- **Duplicate Detection**: Automatically identifies and resolves duplicate modifications
- **Interactive Resolution**: User-friendly table interface for resolving conflicts
- **Batch Download**: Download all updated files at once or individually
- **Modern UI**: Clean, responsive design using TailwindCSS and Radix UI

## 📋 Supported File Types

### Excel Files (.xlsx)

Should contain sheets with the following names:

- `Single` - Single contingency modifications
- `P2-1` - Bus contingency modifications
- `Bus` - Bus contingency modifications
- `Line_FB` - Line contingency modifications
- `Tower` - Tower contingency modifications

### Base Files (.con)

Standard contingency files that will be modified based on Excel inputs.

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd contingency-file-processor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📖 Usage

### Step 1: Upload Files

- Upload Excel files containing contingency modifications
- Upload base contingency (.con) files to be modified

### Step 2: Processing

The application will automatically:

- Parse Excel files for Delete/Add operations
- Analyze base contingency files
- Detect duplicate modifications

### Step 3: Resolve Duplicates

If duplicates are found:

- Review the interactive table
- Select preferred modification for each duplicate
- Click "Proceed with Selected Resolutions"

### Step 4: Download Results

- Download all updated files at once
- Or download individual files as needed
- Files are prefixed with `[REVISED] -` for easy identification

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components (Radix UI)
│   ├── ContingencyFileUploader.tsx    # File upload interface
│   └── DuplicateResolutionTable.tsx   # Duplicate resolution table
├── lib/
│   ├── utils.ts              # Utility functions
│   └── contingency-utils.ts  # Core processing logic
├── pages/
│   ├── Index.tsx             # Homepage
│   ├── ContingencyProcessor.tsx  # Main application
│   └── NotFound.tsx          # 404 page
├── types/
│   └── contingency.ts        # TypeScript type definitions
├── App.tsx                   # Main app component with routing
└── main.tsx                  # Application entry point
```

## 🧪 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run format.fix` - Format code with Prettier

## 🔧 Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling framework
- **Radix UI** - Accessible UI components
- **xlsx** - Excel file processing
- **Lucide React** - Icons

## 📝 File Processing Logic

The application follows this processing workflow:

1. **Excel Parsing**: Reads Excel sheets and extracts Delete/Add operations
2. **Duplicate Detection**: Identifies conflicts between multiple sources
3. **User Resolution**: Allows manual selection of preferred modifications
4. **File Generation**: Creates updated .con files with modifications applied
5. **Download**: Provides updated files with proper naming convention

## 🎨 UI Components

The application uses a comprehensive design system with:

- Consistent spacing and typography
- Accessible form controls
- Responsive grid layouts
- Progress indicators
- Interactive tables
- File upload zones with drag & drop

## 🔍 Error Handling

- Comprehensive error messages for file processing issues
- Validation for required file selections
- User-friendly feedback throughout the process
- Graceful handling of malformed Excel files

## 📦 Build and Deploy

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Preview build locally**

   ```bash
   npm run preview
   ```

3. **Deploy** the `dist` folder to your preferred hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
