import React, { useEffect, useState } from 'react';
import { Text, Image, View, TouchableOpacity, Linking, StyleSheet, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import * as MailComposer from 'expo-mail-composer';
import api from '../../services/api';

interface IParams {
	point_id: number;
}

interface IData {
	point: {
		image: string;
		name: string;
		email: string;
		whatsapp: string;
		city: string;
		uf: string;
	};
	items: { title: string }[];
}

const Detail = () => {
	//======================
	// ESTADO E CONSTANTES
	//======================
	//Estados ncessários
	const [data, setData] = useState<IData>({} as IData);

	//Constantes para Navegação
	const navigation = useNavigation();
	const route = useRoute();

	//Parametros vindo da outra tela
	const routeParams = route.params as IParams;

	//======================
	// HOOKS
	//======================
	//Carrega os dados do ponto passado por parametro da outra tela
	useEffect(() => {
		api.get(`points/${routeParams.point_id}`).then(response => {
			setData(response.data);
		});
	}, []);

	//======================
	// FUNÇÔES
	//======================
	//Volta a tela anterior
	function handleNavigationBack() {
		navigation.goBack();
	}

	//Ao clicar no botão para whats usa esse link para mandar abrir no whats
	function handleWhatsApp() {
		Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Interesse na coleta de serviço`);
	}

	//Essa esse pacote para abrir o email ja com os dados preenchidos
	function handleComposeMail() {
		MailComposer.composeAsync({
			subject: 'Interesse na coleta de residuos',
			recipients: [data.point.email],
		});
	}

	//Caso não tenha carregado ainda os dados não exibir nada
	if (!data.point) {
		return null;
	}

	//======================
	// RENDER
	//======================
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<TouchableOpacity onPress={handleNavigationBack}>
					<Icon name="arrow-left" size={25} color="#34cb79" />
				</TouchableOpacity>

				<Image style={styles.pointImage} source={{ uri: data.point.image }} />
				<Text style={styles.pointName}>{data.point.name}</Text>
				<Text style={styles.pointItems}>{data.items.map(item => item.title).join(', ')}</Text>

				<View style={styles.address}>
					<Text style={styles.addressTitle}>Endereço</Text>
					<Text style={styles.addressContent}>
						{data.point.city} - {data.point.uf}
					</Text>
				</View>
			</View>

			<View style={styles.footer}>
				<RectButton style={styles.button} onPress={handleWhatsApp}>
					<FontAwesome name="whatsapp" size={20} color="#fff" />
					<Text style={styles.buttonText}>Whatsapp</Text>
				</RectButton>

				<RectButton style={styles.button} onPress={handleComposeMail}>
					<Icon name="mail" size={20} color="#fff" />
					<Text style={styles.buttonText}>E-mail</Text>
				</RectButton>
			</View>
		</SafeAreaView>
	);
};

export default Detail;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
		paddingTop: 20 + Constants.statusBarHeight,
	},

	pointImage: {
		width: '100%',
		height: 120,
		resizeMode: 'cover',
		borderRadius: 10,
		marginTop: 32,
	},

	pointName: {
		color: '#322153',
		fontSize: 28,
		fontFamily: 'Ubuntu_700Bold',
		marginTop: 24,
	},

	pointItems: {
		fontFamily: 'Roboto_400Regular',
		fontSize: 16,
		lineHeight: 24,
		marginTop: 8,
		color: '#6C6C80',
	},

	address: {
		marginTop: 32,
	},

	addressTitle: {
		color: '#322153',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	},

	addressContent: {
		fontFamily: 'Roboto_400Regular',
		lineHeight: 24,
		marginTop: 8,
		color: '#6C6C80',
	},

	footer: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: '#999',
		paddingVertical: 20,
		paddingHorizontal: 32,
		paddingBottom: 25,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	button: {
		width: '48%',
		backgroundColor: '#34CB79',
		borderRadius: 10,
		height: 50,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonText: {
		marginLeft: 8,
		color: '#FFF',
		fontSize: 16,
		fontFamily: 'Roboto_500Medium',
	},
});
