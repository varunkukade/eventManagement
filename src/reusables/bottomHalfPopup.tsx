import React, { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal, { ModalProps } from 'react-native-modal';
import { colors, measureMents } from '@/utils/appStyles';
import TextComponent from './text';
import { useAppSelector } from '@/reduxConfig/store';

export type EachAction = {
  icon: () => ReactElement;
  label: string;
  onClick: () => void;
  isVisible: boolean;
};

interface CenterPopupComponentProps
  extends Omit<
    ModalProps,
    'onBackButtonPress' | 'onBackdropPress' | 'isVisible'
  > {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  actions?: EachAction[];
  modalHeader?: string;
  showActions: boolean;
  children: ReactNode;
}

const BottomHalfPopupComponent = ({
  setIsModalVisible,
  isModalVisible,
  actions,
  modalHeader,
  showActions,
  children,
  ...props
}: CenterPopupComponentProps): ReactElement => {
  const togglePopupState = () => {
    setIsModalVisible(!isModalVisible);
  };
  const theme = useAppSelector((state) => state.user.currentUser.theme);

  return (
    <Modal
      onBackButtonPress={togglePopupState}
      onBackdropPress={togglePopupState}
      {...props}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      isVisible={isModalVisible}
    >
      <ScrollView
        style={[
          styles.modalContainer,
          { backgroundColor: colors[theme].cardColor },
        ]}
      >
        <View
          style={[
            styles.modalCommonLine,
            {
              backgroundColor:
                theme === 'dark'
                  ? colors.dark.greyColor
                  : colors.light.lavenderColor,
            },
          ]}
        />
        {showActions && actions?.length ? (
          <View>
            <View style={styles.titleContainer}>
              <TextComponent
                weight="extraBold"
                style={{ fontSize: 17, color: colors[theme].textColor }}
              >
                {modalHeader}
              </TextComponent>
            </View>
            <View style={[styles.actionsContainer]}>
              {actions.map((eachAction, index) => {
                if (eachAction.isVisible) {
                  return (
                    <View key={index} style={styles.eachActionContainer}>
                      <TouchableOpacity
                        onPress={eachAction.onClick}
                        activeOpacity={0.5}
                        style={[
                          styles.eachActionStyle,
                          { backgroundColor: colors[theme].lightLavenderColor },
                        ]}
                      >
                        {eachAction.icon()}
                      </TouchableOpacity>
                      <TextComponent
                        style={{
                          textAlign: 'center',
                          color: colors[theme].greyColor,
                        }}
                        weight="semibold"
                      >
                        {eachAction.label}
                      </TextComponent>
                    </View>
                  );
                } else return children;
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Modal>
  );
};

export default BottomHalfPopupComponent;

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 10,
    paddingBottom: 22,
    borderRadius: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 350,
    paddingHorizontal: measureMents.leftPadding,
  },
  modalCommonLine: {
    width: 50,
    height: 6,
    alignSelf: 'center',
    borderRadius: 15,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: measureMents.leftPadding,
  },
  eachActionContainer: {
    width: 75,
    marginRight: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  eachActionStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
});
