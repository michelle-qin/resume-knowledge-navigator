import React from 'react';
import { StyleSheet, View, Text, Pressable, LayoutAnimation, Platform, UIManager, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../colors';
//dummy data

function conditional_render_toc_item(props) {

    console.log ('rendered')

    return (
        
        (props.expanded && typeof(props.content) == 'string') ? (

        <View style={styles.child}>
            <Text>{props.data}</Text>    
        </View> 
    
        ) : (props.expanded && props.content == 'array') ? (

            <View style={styles.child}>
                <FlatList
                    data = {props.data}
                    renderItem = {({item}) => <sub_item content={item}/>}
                />
            </View>
        ) : null

    );
}

const sub_item = (content) => {

    <View style={styles.sub_item}>
        <Text style={styles.content}>{content}</Text>
    </View> 

}

//takes props header, content 
const toc_item = (props) => {

    console.log('toc_item')

    const [expanded, setExpanded] = React.useState(false);

    return(

        <View>

            <Pressable style={styles.row} onPress={() => setExpanded(!expanded)}>

                <Text style={[styles.title, styles.font]}>{props.header}</Text>
                <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={colors.gray09} />
            
            </Pressable>

            <View style={styles.parentHr}/> 

            {conditional_render_toc_item({expanded:expanded, content:props.content})}

        </View>
                

    );

}

//takes prop data, which is an array of toc_items
const ToC = (props) => {

    const [listDataSource, setListDataSource] = React.useState(props.data);
    console.log(listDataSource)

    return(

        <View style={styles.container}>
            
            listDataSource.map(({header:content}) => (<toc_item header = {header} content = {content} />))}

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