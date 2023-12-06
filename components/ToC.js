import React from 'react';
import { StyleSheet, View, Text, Pressable, LayoutAnimation, Platform, UIManager, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../colors';
//dummy data

function Conditional_render_toc_item(props) {

    return (

        (props.expanded && typeof (props.content) == 'string') ? (

            <View style={styles.dropdown}>
                <Text>{props.content}</Text>
            </View>

        ) : (props.expanded && typeof (props.content) == 'object') ? (

            <View style={styles.exp_container}>
                <FlatList
                    style={styles.exp_flatlist}
                    data={props.content}
                    renderItem={({ item }) => <Sub_item content={item} />}
                />
            </View>

        ) : console.log('all conditions failed')

    );
}

const Sub_item = (content) => {

    <View style={styles.exp_flatlist_item}>
        <Text style={styles.exp_flatlist_item_text}>{content}</Text>
    </View>

}

//takes props header, content 
const Toc_item = (props) => {


    const [expanded, setExpanded] = React.useState(false);

    return (

        <View style={styles.toc_item}>

            <Pressable style={styles.toc_section} onPress={() => setExpanded(!expanded)}>

                <Text style={[styles.section_title]}>{props.header}</Text>
                <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={colors.gray00} />

            </Pressable>

            <View style={styles.parentHr} />

            <Conditional_render_toc_item expanded={expanded} content={props.content} />

        </View>


    );

}

//takes prop data, which is an array of toc_items
const ToC = (props) => {

    const [listDataSource, setListDataSource] = React.useState(props.data);

    return (
        <FlatList
            style={styles.toc_container}
            data={Object.keys(listDataSource)}
            renderItem={({ item }) => <Toc_item header={item} content={listDataSource[item]} />}
        />

    );

}

const styles = StyleSheet.create({

    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.gray09,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 56,
        paddingLeft: 25,
        paddingRight: 18,
        alignItems: 'center',
        backgroundColor: colors.gray05,
    },
    parentHr: {
        height: 1,
        color: colors.white,
        width: '100%'
    },
    child: {
        backgroundColor: colors.gray03,
        padding: 16,
    },
    toc_container: {
        flex: 1,
        alignSelf: 'stretch',
        backgroundColor: "#ececec"
    },
    toc_item: {
        backgroundColor: "#ececec",
        padding: 16,
    },
    toc_section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    section_title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.gray00,
    },
    dropdown: {
        backgroundColor: "#ececec",
        padding: 16,
    },
    exp_container: {
        backgroundColor: "#ececec",
        padding: 16,
    },
    exp_flatlist: {
        backgroundColor: "#ececec",
        padding: 16,
    },
    exp_flatlist_item: {
        backgroundColor: "#ececec",
        padding: 16,
    },
    exp_flatlist_item_text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.gray09,
    },

});


export default ToC;