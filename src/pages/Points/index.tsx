import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, View, Image, ScrollView, StyleSheet, Alert, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';
import * as Location from 'expo-location';

interface IItems {
	id: number;
	title: string;
	image_url: string;
}

interface IPoint {
	id: number;
	name: string;
	image: string;
	image_url: string;
	latitude: number;
	longitude: number;
}

interface IParams {
	uf: string;
	city: string;
}

const Points = () => {
	//======================
	// ESTADO E CONSTANTES
	//======================
	//Estados ncessários
	const [items, setItems] = useState<IItems[]>([]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [points, setPoints] = useState<IPoint[]>([]);
	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

	//Constantes para Navegação
	const navigation = useNavigation();
	const routes = useRoute();

	//Parametros vindo da outra tela
	const routesParams = routes.params as IParams;

	//======================
	// HOOKS
	//======================
	//Carrega os possiveis items para poder selecionar e encontrar os pontos de coleta
	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		});
	}, []);

	//Ao carregar a tela já acessa a localização para centralizar o mapa
	useEffect(() => {
		async function loadPosition() {
			const { status } = await Location.requestPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Atenção', 'Presisamos da permissão a Localização para continuar!');
				return;
			}

			const location = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = location.coords;
			setInitialPosition([latitude, longitude]);
		}

		loadPosition();
	}, []);

	//A cada seleção de itens pesquisa novamente os pontos com os dados informados
	useEffect(() => {
		api.get('points', {
			params: {
				city: routesParams.city,
				uf: routesParams.uf,
				items: selectedItems,
			},
		}).then(response => {
			setPoints(response.data);
		});
	}, [selectedItems]);

	//======================
	// FUNÇÔES
	//======================
	//Volta a tela anterior
	function handleNavigationBack() {
		navigation.goBack();
	}

	//Avança para a tela do detalhe ao clicar na marker do mapa
	function handleNavigateToDetail(id: number) {
		navigation.navigate('Detail', { point_id: id });
	}

	//Faz a jogada com as seleções dos itens e com cada alteração ja realiza o hook para pesquisar os pontos de coleta
	function handleSelectItem(id: number) {
		//Verifica se o item clicado já estava selecionado
		const itemJaSelecionado = selectedItems.findIndex(item => item === id);
		if (itemJaSelecionado >= 0) {
			//Caso já exista o item, retorna uma nova lista sem o item
			const itemsSemItemClicado = selectedItems.filter(item => item !== id);
			//Adiciona o array
			setSelectedItems(itemsSemItemClicado);
		} else {
			//Caso o item não estava selecionado, adiciona o que tinha antes + o item
			setSelectedItems([...selectedItems, id]);
		}
	}

	//======================
	// RENDER
	//======================
	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={handleNavigationBack}>
					<Icon name="arrow-left" size={25} color="#34cb79" />
				</TouchableOpacity>

				<Text style={styles.title}>Bem vindo</Text>
				<Text style={styles.description}>Encontre no mapa um ponto de coleta</Text>

				<View style={styles.mapContainer}>
					{initialPosition[0] === 0 ? (
						<ProgressBarAndroid
							style={{
								flex: 1,
								width: 100,
								height: 100,
								justifyContent: 'center',
								alignSelf: 'center',
							}}
						/>
					) : (
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: initialPosition[0],
								longitude: initialPosition[1],
								latitudeDelta: 0.014,
								longitudeDelta: 0.014,
							}}
						>
							{points.map(point => (
								<Marker
									key={String(point.id)}
									style={styles.mapMarker}
									onPress={() => handleNavigateToDetail(point.id)}
									coordinate={{
										latitude: point.latitude,
										longitude: point.longitude,
									}}
								>
									<View style={styles.mapMarkerContainer}>
										<Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
										<Text style={styles.mapMarkerTitle}>{point.name}</Text>
									</View>
								</Marker>
							))}
						</MapView>
					)}
				</View>
			</View>
			<View style={styles.itemsContainer}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20 }}
				>
					{items.map(item => (
						<TouchableOpacity
							onPress={() => handleSelectItem(item.id)}
							activeOpacity={0.6}
							key={String(item.id)}
							style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]}
						>
							<SvgUri width={42} height={42} uri={item.image_url} />
							<Text style={styles.itemTitle}>{item.title}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</>
	);
};

export default Points;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 32,
		paddingTop: 20 + Constants.statusBarHeight,
	},

	title: {
		fontSize: 20,
		fontFamily: 'Ubuntu_700Bold',
		marginTop: 24,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 4,
		fontFamily: 'Roboto_400Regular',
	},

	mapContainer: {
		flex: 1,
		width: '100%',
		borderRadius: 10,
		overflow: 'hidden',
		marginTop: 16,
	},

	map: {
		width: '100%',
		height: '100%',
	},

	mapMarker: {
		width: 90,
		height: 80,
	},

	mapMarkerContainer: {
		width: 90,
		height: 70,
		backgroundColor: '#34CB79',
		flexDirection: 'column',
		borderRadius: 8,
		overflow: 'hidden',
		alignItems: 'center',
	},

	mapMarkerImage: {
		width: 90,
		height: 45,
		resizeMode: 'cover',
	},

	mapMarkerTitle: {
		flex: 1,
		fontFamily: 'Roboto_400Regular',
		color: '#FFF',
		fontSize: 13,
		lineHeight: 23,
	},

	itemsContainer: {
		flexDirection: 'row',
		marginTop: 16,
		marginBottom: 32,
	},

	item: {
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#eee',
		height: 120,
		width: 120,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 16,
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'space-between',

		textAlign: 'center',
	},

	selectedItem: {
		borderColor: '#34CB79',
		borderWidth: 2,
	},

	itemTitle: {
		fontFamily: 'Roboto_400Regular',
		textAlign: 'center',
		fontSize: 13,
	},
});
