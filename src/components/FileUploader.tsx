import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Icon,
  Text,
  VStack,
  useToast,
  HStack,
  Progress,
  IconButton,
} from 'native-base';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface FileUploaderProps {
  onFileSelect: (file: any) => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  allowedTypes = ['pdf', 'jpg', 'jpeg', 'png'],
  maxSize = 10, // Default 10MB
}) => {
  const [file, setFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  // Fungsi untuk memeriksa jenis file
  const checkFileType = (fileUri: string) => {
    const extension = fileUri.split('.').pop()?.toLowerCase() || '';
    return allowedTypes.includes(extension);
  };

  // Fungsi untuk memeriksa ukuran file
  const checkFileSize = async (fileUri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSizeInMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;
      return fileSizeInMB <= maxSize;
    } catch (error) {
      console.error('Error checking file size:', error);
      return false;
    }
  };

  // Pilih dokumen (PDF)
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedFile = result.assets[0];
      
      if (!checkFileType(selectedFile.uri)) {
        toast.show({
          title: 'Tipe file tidak didukung',
          description: `Hanya file ${allowedTypes.join(', ')} yang diperbolehkan`,
          status: 'error',
        });
        return;
      }

      const isValidSize = await checkFileSize(selectedFile.uri);
      if (!isValidSize) {
        toast.show({
          title: 'File terlalu besar',
          description: `Ukuran maksimum file adalah ${maxSize}MB`,
          status: 'error',
        });
        return;
      }

      setFile(selectedFile);
      onFileSelect(selectedFile);
    } catch (error) {
      console.error('Error picking document:', error);
      toast.show({
        title: 'Gagal memilih file',
        description: 'Terjadi kesalahan saat memilih file',
        status: 'error',
      });
    }
  };

  // Pilih gambar dari galeri
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets[0];
      
      const isValidSize = await checkFileSize(selectedImage.uri);
      if (!isValidSize) {
        toast.show({
          title: 'Gambar terlalu besar',
          description: `Ukuran maksimum file adalah ${maxSize}MB`,
          status: 'error',
        });
        return;
      }

      setFile(selectedImage);
      onFileSelect(selectedImage);
    } catch (error) {
      console.error('Error picking image:', error);
      toast.show({
        title: 'Gagal memilih gambar',
        description: 'Terjadi kesalahan saat memilih gambar',
        status: 'error',
      });
    }
  };

  // Ambil foto dengan kamera
  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        toast.show({
          title: 'Izin diperlukan',
          description: 'Kami membutuhkan izin kamera untuk mengambil foto',
          status: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const capturedImage = result.assets[0];
      
      setFile(capturedImage);
      onFileSelect(capturedImage);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.show({
        title: 'Gagal mengambil foto',
        description: 'Terjadi kesalahan saat mengambil foto',
        status: 'error',
      });
    }
  };

  // Hapus file yang dipilih
  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  // Simulasi upload (hanya untuk tampilan)
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.show({
            title: 'Upload berhasil',
            description: 'File Anda berhasil diunggah',
            status: 'success',
          });
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };

  return (
    <Box width="100%">
      {!file ? (
        <Center
          p={6}
          borderWidth={2}
          borderColor="gray.300"
          borderStyle="dashed"
          borderRadius="md"
          bg="gray.50"
        >
          <VStack space={4} alignItems="center">
            <Icon
              as={FontAwesome5}
              name="file-upload"
              size="5xl"
              color="primary.500"
            />
            <Text textAlign="center" fontSize="md" color="gray.600">
              Drag & drop file PDF atau gambar di sini, atau klik tombol di bawah untuk memilih file
            </Text>
            <Text fontSize="xs" color="gray.500">
              Format yang didukung: {allowedTypes.join(', ')} (Maks. {maxSize}MB)
            </Text>
            <HStack space={3}>
              <Button
                leftIcon={<Icon as={FontAwesome5} name="file-pdf" size="sm" />}
                onPress={handleDocumentPick}
              >
                Pilih PDF
              </Button>
              <Button
                leftIcon={<Icon as={FontAwesome5} name="image" size="sm" />}
                onPress={handleImagePick}
                variant="outline"
              >
                Pilih Gambar
              </Button>
              <Button
                leftIcon={<Icon as={FontAwesome5} name="camera" size="sm" />}
                onPress={handleCameraCapture}
                variant="outline"
              >
                Kamera
              </Button>
            </HStack>
          </VStack>
        </Center>
      ) : (
        <Box borderWidth={1} borderColor="gray.200" borderRadius="md" p={4}>
          <HStack alignItems="center" space={4}>
            <Icon
              as={FontAwesome5}
              name={file.uri.endsWith('.pdf') ? 'file-pdf' : 'file-image'}
              size="2xl"
              color="primary.500"
            />
            <VStack flex={1}>
              <Text fontWeight="bold" isTruncated>
                {file.name || 'File dipilih'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
              {isUploading && (
                <Progress
                  value={uploadProgress}
                  colorScheme="primary"
                  size="xs"
                  mt={2}
                />
              )}
            </VStack>
            <IconButton
              icon={<Icon as={MaterialIcons} name="close" />}
              variant="ghost"
              colorScheme="gray"
              onPress={handleRemoveFile}
              size="sm"
            />
          </HStack>
          {!isUploading && (
            <Button mt={4} onPress={simulateUpload} isLoading={isUploading}>
              Upload File
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUploader; 