import React, { useState } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  StyleSheet 
} from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { Eye, Download } from "lucide-react-native";
import Pdf from "react-native-pdf";

interface ReceiptViewDialogProps {
  receiptUrl: string;
  orderId: string;
}

export const ReceiptViewDialog = ({ receiptUrl, orderId }: ReceiptViewDialogProps) => {
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const fileExt = receiptUrl.split(".").pop();
      const localPath = `${RNFS.DocumentDirectoryPath}/comprovante-pedido-${orderId.slice(-6)}.${fileExt}`;

      const download = await RNFS.downloadFile({
        fromUrl: receiptUrl,
        toFile: localPath,
      }).promise;

      if (download && download.statusCode === 200) {
        await Share.open({
          url: `file://${localPath}`,
          type: fileExt === "pdf" ? "application/pdf" : `image/${fileExt}`,
        });
      }
    } catch (error) {
      console.error("Erro ao baixar comprovante:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isImage = /\.(jpeg|jpg|gif|png)$/i.test(receiptUrl);
  const isPdf = /\.pdf$/i.test(receiptUrl);

  return (
    <View>
      {/* Botão para abrir modal */}
      <TouchableOpacity 
        style={styles.buttonOutline} 
        onPress={() => setVisible(true)}
      >
        <Eye size={16} color="#000" />
        <Text style={styles.buttonText}>Ver Comprovante</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              Comprovante PIX - Pedido #{orderId.slice(-6)}
            </Text>

            <View style={styles.viewer}>
              {isImage && (
                <Image 
                  source={{ uri: receiptUrl }} 
                  style={styles.image} 
                  resizeMode="contain" 
                />
              )}

              {isPdf && (
                <Pdf
                  source={{ uri: receiptUrl, cache: true }}
                  style={styles.pdf}
                />
              )}

              {!isImage && !isPdf && (
                <View style={styles.unsupported}>
                  <Text>Tipo de arquivo não suportado para visualização</Text>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleDownload}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Download size={16} color="#fff" />
                    <Text style={styles.buttonText}>Baixar Comprovante</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.buttonClose} 
                onPress={() => setVisible(false)}
              >
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  buttonText: {
    marginLeft: 6,
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    maxHeight: "90%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  viewer: {
    flex: 1,
    minHeight: 300,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 400,
  },
  pdf: {
    flex: 1,
    height: 400,
  },
  unsupported: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  buttonClose: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 6,
  },
});
