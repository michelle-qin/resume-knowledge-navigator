import React from 'react';
import { StyleSheet, View, Text, Pressable, LayoutAnimation, Platform, UIManager, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../colors';
//dummy data

function Conditional_render_toc_item(props) {

    console.log('props.expanded:')
    console.log(props.expanded)
    console.log('props.content:')
    console.log(typeof(props.content))

    return (
        
        (props.expanded && typeof(props.content) == 'string') ? (

        <View style={styles.child}>
            <Text>{props.content}</Text>    
        </View> 
    
        ) : (props.expanded && typeof(props.content) == 'object') ? (

            <View style={styles.child}>
                <FlatList
                    data = {props.content}
                    renderItem = {({item}) => <Sub_item content={item}/>}
                />
            </View>

        ) : console.log('all conditions failed')

    );
}

const Sub_item = (content) => {

    <View style={styles.sub_item}>
        <Text style={styles.content}>{content}</Text>
    </View> 

}

//takes props header, content 
const Toc_item = (props) => {


    const [expanded, setExpanded] = React.useState(false);

    return(

        <View>

            <Pressable style={styles.row} onPress={() => setExpanded(!expanded)}>

                <Text style={[styles.title, styles.font]}>{props.header}</Text>
                <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={colors.gray09} />
            
            </Pressable>

            <View style={styles.parentHr}/> 

            <Conditional_render_toc_item expanded = {expanded} content = {props.content} />

        </View>
                

    );

}

//takes prop data, which is an array of toc_items
const ToC = (props) => {

    const [listDataSource, setListDataSource] = React.useState(props.data);

    return(

        <View style={styles.container}>
            
            <FlatList
                data = {Object.keys(listDataSource)}
                renderItem = {({item}) => <Toc_item header = {item} content = {listDataSource[item]}/>}
            />


        </View>

    );
    
}

const styles = StyleSheet.create({

    title:{
        fontSize: 14,
        fontWeight:'bold',
        color: colors.gray09,
    },
    row:{
        flexDirection: 'row',
        justifyContent:'space-between',
        height:56,
        paddingLeft:25,
        paddingRight:18,
        alignItems:'center',
        backgroundColor: colors.gray05,
    },
    parentHr:{
        height:1,
        color: colors.white,
        width:'100%'
    },
    child:{
        backgroundColor: colors.gray03,
        padding:16,
    }
});

export default ToC;