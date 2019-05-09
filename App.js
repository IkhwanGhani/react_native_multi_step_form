import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeModules,
  FlatList,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Alert
} from "react-native";
//Library
import FloatLabelTextInput from "react-native-floating-label-text-input";
import FullWidthImage from "react-native-fullwidth-image";
import ImageScalable from "react-native-scalable-image";
import PhotoGrid from "react-native-thumbnail-grid";
import CameraRollPicker from "react-native-camera-roll-picker";
import CustomModal from "react-native-modal";
import { AutoGrowingTextInput } from "react-native-autogrow-textinput";
import { QRscanner } from "react-native-qr-scanner";
import { Container, Content, Input, Form, Item, Label } from "native-base";
import ImagePicker from "react-native-image-crop-picker";
// let ImagePicker = NativeModules.ImageCropPicker;

//Icons
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

//const
//import * from "./constant";

//style
//import DEFAULT_COLOR from "./color";
import defaultStyle from "./styles/styles";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //****** defectImages *******/
      //add/edit/upload
      selectedCamRoll: [],
      visiblePickerSelection: false,
      imagesCam: [],
      visibleCameraRoll: false,
      visibleShowEditImages: false,
      visibleFullEditImage: false,
      fullEditImages: [],
      imageUpload: [],

      //****** qrcode *******/
      visibleQRCode: false,
      flashMode: false,
      zoom: 0.2,
      // QRresult: '',

      //****** WizardFormModal *******/
      visibleStep2: false,
      visibleStep3: false,

      //****** FormInput *******/
      input: {
        location: "",
        equipment: "",
        responsibleDept: { name: "-none-" },
        requestTime: "",
        title: "",
        description: "",
        extras: {}
      },
      error: {
        location: "",
        equipment: "",
        requestTime: "",
        title: "",
        description: "",
        extras: ""
      }
    };
    this.requestCameraPermission();
    this.getSelectedImages = this.getSelectedImages.bind(this);
  }

  componentDidMount() {
    //DateTime
    date = new Date().toLocaleDateString();
    time = new Date().toLocaleTimeString();
    this.setState({
      input: { ...this.state.input, requestTime: date + ", " + time }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {/* Step 1 */}
        <Container>
          <View
            style={{
              backgroundColor: "#0f2b59",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity>
                <Text style={{ color: "#fff", textAlign: "left" }} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 5 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                STEP 1
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity>
                <Text style={{ color: "#fff", textAlign: "right" }} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => this.toggleQRCode(true)}
            style={styles.qrCodeBtn}
          >
            <View
              style={{ justifyContent: "center" }}
              onPress={() => this.toggleQRCode(true)}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={30}
                style={{ color: "#33ccff" }}
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <Text
                style={{
                  color: "#222",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "left"
                }}
              >
                Scan QR Code
              </Text>
              <Text
                style={{
                  color: "#888",
                  fontSize: 11,
                  fontWeight: "bold",
                  textAlign: "left"
                }}
              >
                Scan QR Code to automatically fill in the form
              </Text>
            </View>
            <View
              style={{ justifyContent: "center" }}
              onPress={() => this.toggleQRCode(true)}
            >
              <Ionicons
                name="ios-arrow-forward"
                size={30}
                style={{ color: "#33ccff" }}
              />
            </View>
          </TouchableOpacity>
          <Container>
            <Content>
              <Form
                style={{ paddingLeft: 20, paddingRight: 40, paddingBottom: 20 }}
              >
                <FloatLabelTextInput
                  placeholder={"Location"}
                  value={this.state.input.location}
                  onChangeTextValue={text =>
                    this.setState({
                      input: { ...this.state.input, location: text }
                    })
                  }
                />
                <Text
                  style={{
                    marginLeft: 20,
                    marginTop: 5,
                    color: "red",
                    fontSize: 9
                  }}
                >
                  {this.state.error.location}
                </Text>
                <FloatLabelTextInput
                  placeholder={"Equipment"}
                  value={this.state.input.equipment}
                  onChangeTextValue={text =>
                    this.setState({
                      input: { ...this.state.input, equipment: text }
                    })
                  }
                />
                <Text
                  style={{
                    marginLeft: 20,
                    marginTop: 5,
                    color: "red",
                    fontSize: 9
                  }}
                >
                  {this.state.error.equipment}
                </Text>
              </Form>
            </Content>
          </Container>
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: "#2377d1" }]}
              onPress={() => this.toggleStep2(true)}
            >
              <Text style={[styles.text, styles.footerTextButton]}>Next</Text>
            </TouchableOpacity>
          </View>
        </Container>

        {/* Step 2 */}
        {this.step2Modal()}
        {/* Step 3 */}
        {this.step3Modal()}

        {this.qrCodeModal()}
        {this.pickerSelectionModal()}
        {this.cameraRollModal()}
        {this.showEditImagesModal()}
        {this.fullEditImageModal()}
      </View>
    );
  }

  // Add Defact Images Function
  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Write External Storage permission accepted");
        console.log("Read External Storage permission accepted");
      } else {
        console.log("Write External Storage permission denied");
        console.log("Read External Storage permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }
  togglePickerSelection(visible) {
    this.setState({
      visiblePickerSelection: visible
    });
  }
  pickSingleWithCamera(cropping) {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true
    })
      .then(imagesCam => {
        console.log("received images from camera:", imagesCam);
        this.setState({
          imagesCam: {
            uri: imagesCam.path,
            width: imagesCam.width,
            height: imagesCam.height
          }
        });
        this.setState({
          imageUpload: this.state.imageUpload.concat(this.state.imagesCam)
        });
      })
      .catch(e => alert(e));

    this.togglePickerSelection(false);
  }
  toggleCameraRoll(visible) {
    this.setState({
      visibleCameraRoll: visible
    });
    this.togglePickerSelection(false);
  }
  getSelectedImages(imagesCamRoll, current) {
    this.setState({
      selectedCamRoll: imagesCamRoll
    });
  }
  doneSelectedImages() {
    // console.log("defect report screen: done get selected images - " + JSON.stringify(this.state.selectedCamRoll, null, "    "));
    this.setState({
      imageUpload: this.state.imageUpload.concat(this.state.selectedCamRoll)
    });
    this.toggleCameraRoll(false);
    this.setState({
      selectedCamRoll: []
    });
  }
  deleteSelectedImages = uri => {
    this.setState(prevState => {
      return {
        imageUpload: prevState.imageUpload.filter(a => {
          return a.uri !== uri;
        })
      };
    });
  };
  toggleShowEditImages(visible) {
    this.setState({
      visibleShowEditImages: visible
    });
  }
  toggleFullEditImage(uri) {
    this.setState({
      visibleFullEditImage: !this.state.visibleFullEditImage,
      fullEditImages: uri
    });
  }

  //Form Function
  toggleStep2(visible) {
    if (this.state.input.location == "" || this.state.input.equipment == "") {
      this.setState({
        error: {
          ...this.state.error,
          location: "*Please fill up this field",
          equipment: "*Please fill up this field"
        }
      });
    } else {
      this.setState({
        error: {
          ...this.state.error,
          location: "",
          equipment: ""
        }
      });
      this.setState({
        visibleStep2: visible
      });
    }
  }
  toggleStep3(visible) {
    if (this.state.input.title == "" || this.state.input.description == "") {
      this.setState({
        error: {
          ...this.state.error,
          title: "*Please fill up this field",
          description: "*Please fill up this field"
        }
      });
    } else {
      this.setState({
        error: {
          ...this.state.error,
          title: "",
          description: ""
        }
      });
      this.setState({
        visibleStep3: visible
      });
    }
  }
  onRead = e => {
    try {
      let json = JSON.parse(e.data);
      if (json) {
        this.setState({
          input: {
            ...this.state.input,
            location: json.location || "",
            equipment: json.equipment || ""
          }
        });
      }
    } catch (err) {
      console.log(`error parsing qr data: ${err}`);
    }
    this.toggleQRCode(false);
  };
  toggleQRCode(visible) {
    this.setState({
      visibleQRCode: visible
    });
  }
  autoGrowingTextInput(event) {
    this.setState({
      input: { ...this.state.input, description: event.nativeEvent.text || "" }
    });
  }
  submitForm(navigation) {
    if (this.state.imageUpload)
      this.state.input.extras = { images: this.state.imageUpload };

    if (this.state.input.extras.images.length == 0) {
      this.setState({
        error: {
          ...this.state.error,
          extras: "*Please fill up this field"
        }
      });
    } else {
      this.setState({
        error: {
          ...this.state.error,
          extras: ""
        }
      });
      Alert.alert(
        "Confirm Submission",
        "Are you sure you want to Submit this Initial Defect Registration (IDR)?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          {
            text: "Submit",
            onPress: () => [
              console.log("OK Pressed"),
              this.toggleStep3(false),
              this.toggleStep2(false),
              // navigation.navigate("Home"),
              this.buildJSON()
            ]
          }
        ],
        { cancelable: false }
      );
    }
  }
  buildJSON = () => {
    this.setState({
      input: {
        location: "",
        equipment: "",
        requestTime: this.state.input.requestTime,
        title: "",
        description: "",
        extras: {}
      },
      imageUpload: []
    });
  };

  //Modal
  step2Modal() {
    return (
      <CustomModal
        isVisible={this.state.visibleStep2}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onRequestClose={() => {
          this.toggleStep2(false);
        }}
        style={{ margin: 0, backgroundColor: "#fff" }}
      >
        <View
          style={{
            backgroundColor: "#0f2b59",
            padding: 20,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableOpacity onPress={() => this.toggleStep2(false)}>
              <Ionicons
                name="md-arrow-back"
                size={24}
                style={{ color: "#fff" }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 5, justifyContent: "center" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "bold",
                textAlign: "center"
              }}
            >
              STEP 2
            </Text>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableOpacity>
              <Text style={{ color: "#fff", textAlign: "right" }} />
            </TouchableOpacity>
          </View>
        </View>
        <Content>
          <Form
            style={{
              paddingLeft: 20,
              paddingRight: 40,
              paddingBottom: 10,
              marginTop: 20
            }}
          >
            <Item stackedLabel disabled>
              <Label style={styles.formLabel}>Date</Label>
              <Input disabled placeholder={this.state.input.requestTime} />
            </Item>
            <FloatLabelTextInput
              placeholder={"Job Title"}
              value={this.state.input.title}
              onChangeTextValue={text =>
                this.setState({ input: { ...this.state.input, title: text } })
              }
            />
            <Text
              style={{
                marginLeft: 20,
                marginTop: 5,
                color: "red",
                fontSize: 9
              }}
            >
              {this.state.error.title}
            </Text>
          </Form>
          <Form
            style={{ paddingHorizontal: 35, paddingBottom: 20, paddingTop: 10 }}
          >
            <Label style={styles.formLabel}>Description of Defect / Work</Label>
            <View
              style={{
                height: 200,
                borderColor: "#b1b1b1",
                borderWidth: 0.5,
                borderRadius: 5,
                marginTop: 10
              }}
            >
              <AutoGrowingTextInput
                style={{ borderWidth: 0, marginHorizontal: 10, fontSize: 18 }}
                placeholder={"Description of Defect / Work"}
                placeholderTextColor="#999"
                maxHeight={200}
                minHeight={35}
                enableScrollToCaret
                value={this.state.input.description}
                onChange={event => this.autoGrowingTextInput(event)}
              />
            </View>
            <Text
              style={{ marginLeft: 5, marginTop: 5, color: "red", fontSize: 9 }}
            >
              {this.state.error.description}
            </Text>
          </Form>
        </Content>
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#2377d1" }]}
            onPress={() => this.toggleStep3(true)}
          >
            <Text style={[styles.text, styles.footerTextButton]}>Next</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    );
  }
  step3Modal() {
    return (
      <CustomModal
        isVisible={this.state.visibleStep3}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onRequestClose={() => {
          this.toggleStep3(false);
        }}
        style={{ margin: 0 }}
      >
        <Container>
          <View
            style={{
              backgroundColor: "#0f2b59",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity onPress={() => this.toggleStep3(false)}>
                <Ionicons
                  name="md-arrow-back"
                  size={24}
                  style={{ color: "#fff" }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 5, justifyContent: "center" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                STEP 3
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity>
                <Text style={{ color: "#fff", textAlign: "right" }} />
              </TouchableOpacity>
            </View>
          </View>
          <Content>
            <Form>
              <TouchableOpacity
                onPress={() => this.togglePickerSelection(true)}
              >
                <View style={styles.addPhotoBtn}>
                  <Ionicons
                    name="md-images"
                    size={24}
                    style={{ marginRight: 10 }}
                  />
                  <Text>Add Defect Image</Text>
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  marginLeft: 20,
                  marginTop: 5,
                  color: "red",
                  fontSize: 9
                }}
              >
                {this.state.error.extras}
              </Text>
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <PhotoGrid
                  style={{ width: 300, height: 300, resizeMode: "contain" }}
                  source={this.state.imageUpload}
                  onPressImage={() => this.toggleShowEditImages(true)}
                />
              </View>
            </Form>
          </Content>
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: "#2377d1" }]}
              onPress={() => this.submitForm(this.props.navigation)}
            >
              <Text style={[styles.text, styles.footerTextButton]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Container>
      </CustomModal>
    );
  }
  qrCodeModal() {
    return (
      <View>
        <Modal
          visible={this.state.visibleQRCode}
          onRequestClose={() => {
            this.toggleQRCode(false);
          }}
          style={{ margin: 0 }}
        >
          <View style={styles.qrCodeContainer}>
            <View
              style={{
                backgroundColor: "#0f2b59",
                padding: 20,
                flexDirection: "row"
              }}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.toggleQRCode(false)}>
                  <Ionicons
                    name="md-arrow-back"
                    size={24}
                    style={{ color: "#fff" }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  QR Code
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{ alignItems: "flex-end" }}
                  onPress={() =>
                    this.setState({ flashMode: !this.state.flashMode })
                  }
                >
                  <Ionicons
                    name="md-flash"
                    size={24}
                    style={{ color: "#fff" }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <QRscanner
              onRead={this.onRead.bind(this)}
              flashMode={this.state.flashMode}
              zoom={this.state.zoom}
              finderY={50}
            />
          </View>
        </Modal>
      </View>
    );
  }
  pickerSelectionModal() {
    return (
      <CustomModal
        isVisible={this.state.visiblePickerSelection}
        onBackdropPress={() => {
          this.togglePickerSelection(false);
        }}
        onRequestClose={() => {
          this.togglePickerSelection(false);
        }}
        style={styles.bottomModal}
      >
        <View style={styles.pickerSelectionContainer}>
          <Text style={{ fontSize: 12, color: "#999", marginVertical: 10 }}>
            Select Photo
          </Text>
          <TouchableOpacity
            onPress={() => this.pickSingleWithCamera(false)}
            style={styles.pickerSelectionBtn}
          >
            <Text style={{ fontSize: 15, color: "#2962FF" }}>
              Take Photo...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.toggleCameraRoll(true)}
            style={styles.pickerSelectionBtn}
          >
            <Text style={{ fontSize: 15, color: "#2962FF" }}>
              Choose from Gallery...
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => this.togglePickerSelection(false)}>
          <View style={styles.btnClose}>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#2962FF" }}
            >
              Cancel
            </Text>
          </View>
        </TouchableOpacity>
      </CustomModal>
    );
  }
  cameraRollModal() {
    return (
      <Modal
        visible={this.state.visibleCameraRoll}
        onRequestClose={() => {
          this.toggleCameraRoll(false);
        }}
        style={{ margin: 0 }}
      >
        <View style={styles.cameraRollContainer}>
          <View
            style={{
              backgroundColor: "#0f2b59",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity onPress={() => this.toggleCameraRoll(false)}>
                <Ionicons
                  name="md-arrow-back"
                  size={24}
                  style={{ color: "#fff" }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                GALLERY
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity onPress={() => this.doneSelectedImages()}>
                <Text style={{ color: "#fff", textAlign: "right" }}>DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#eee",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#555",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  {" "}
                  {this.state.selectedCamRoll.length}{" "}
                </Text>{" "}
                images has been selected from gallery
              </Text>
            </View>
          </View>
          <CameraRollPicker
            groupTypes="SavedPhotos"
            maximum={20}
            selected={this.state.selectedCamRoll}
            assetType="Photos"
            imagesPerRow={3}
            imageMargin={5}
            callback={this.getSelectedImages}
          />
        </View>
      </Modal>
    );
  }
  showEditImagesModal() {
    return (
      <Modal
        visible={this.state.visibleShowEditImages}
        onRequestClose={() => {
          this.toggleShowEditImages(false);
        }}
        style={{ margin: 0 }}
      >
        <View style={styles.showEditImagesContainer}>
          <View
            style={{
              backgroundColor: "#0f2b59",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => this.toggleShowEditImages(false)}
              >
                <Ionicons
                  name="md-arrow-back"
                  size={24}
                  style={{ color: "#fff" }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                EDIT
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => this.toggleShowEditImages(false)}
              >
                <Text style={{ color: "#fff", textAlign: "right" }} />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#eee",
              padding: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#555",
                  fontSize: 15,
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  {" "}
                  {this.state.imageUpload.length}{" "}
                </Text>{" "}
                images has been upload
              </Text>
            </View>
          </View>
          <ScrollView>
            <FlatList
              data={this.state.imageUpload}
              keyExtractor={(item, index) => index.toString()}
              renderItem={data => (
                <View style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => this.deleteSelectedImages(data.item.uri)}
                  >
                    <Ionicons
                      name="md-close"
                      size={30}
                      style={{ color: "#fff" }}
                    />
                  </TouchableOpacity>
                  <View style={{ marginBottom: 10, alignItems: "center" }}>
                    <ImageScalable
                      width={Dimensions.get("window").width}
                      source={data.item}
                      onPress={() => this.toggleFullEditImage(data.item)}
                    />
                  </View>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => this.togglePickerSelection(true)}>
              <View style={styles.addPhotoBtn}>
                <Ionicons
                  name="md-images"
                  size={24}
                  style={{ marginRight: 10 }}
                />
                <Text>Add Photo</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }
  fullEditImageModal() {
    // console.log(`\n[task list] item: ${JSON.stringify(this.state.fullEditImages, null, "    ")}`);
    return (
      <Modal
        visible={this.state.visibleFullEditImage}
        onRequestClose={() => {
          this.toggleFullEditImage();
        }}
        style={{ margin: 0 }}
      >
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => this.toggleFullEditImage()}
        >
          <Ionicons name="md-arrow-back" size={30} style={{ color: "#fff" }} />
        </TouchableOpacity>
        <View style={styles.fullEditImageContainer}>
          <FullWidthImage source={this.state.fullEditImages} />
        </View>
      </Modal>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  text: {
    fontFamily: "Roboto"
  },
  container: {
    flex: 1
  },
  formLabel: {
    fontSize: 12,
    color: "#B1B1B1"
  },
  addPhotoBtn: {
    flexDirection: "row",
    padding: 12,
    marginVertical: 16,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "lightblue"
  },
  qrCodeBtn: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#eee"
  },
  filterButton: {
    paddingVertical: 5,
    flex: 1,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  filterText: {
    fontSize: 12
    // color: '#fff',
  },
  qrCodeContainer: {
    flex: 1,
    backgroundColor: "#000"
  },
  pickerSelectionContainer: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 10
  },
  cameraRollContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  showEditImagesContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  },
  fullEditImageContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center"
  },
  pickerSelectionBtn: {
    paddingVertical: 15,
    borderColor: "#eee",
    borderTopWidth: 1,
    width: "100%",
    alignItems: "center"
  },
  btnClose: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 15,
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 10
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  footerContainer: {
    justifyContent: "flex-end"
  },
  footerBtn: {
    alignItems: "center",
    paddingVertical: 18
  },
  footerTextButton: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold"
  }
});
