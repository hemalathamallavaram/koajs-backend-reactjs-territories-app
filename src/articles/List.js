import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button,Input } from 'reactstrap';

import './List.css';

class List extends Component {  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      error: null,
      territories:[],
      filteredArticles:[],
      selectedTerritories:[]
    };
    this.filterArticles = this.filterArticles.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
  }
  async allArticles(territoryIds){
    let promisearr = territoryIds.map((id)=>{
      return this.fetchArticleByTerritory(id);
    })
    return Promise.all(promisearr)
  }
  async fetchArticleByTerritory(territoryId){
    try {
      await new Promise(res => this.setState({
        loading: true,
      }, res));
      let result = await fetch(`/api/articlesInATerritory/${territoryId}`);
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      return await result.json();
    } catch(e) {
      this.setState({
        loading: false,
        error: e,
      });
    }
  }
  async fetch() {
    try {
      await new Promise(res => this.setState({
        loading: true,
      }, res));
      let result = await fetch(`/api/territories/`);
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      let json = await result.json();
      this.setState({
        loading: false,
        error: null,
        territories:json.territories
      });
    } catch(e) {
      this.setState({
        loading: false,
        error: e,
      });
    }
    try {
      await new Promise(res => this.setState({
        loading: true,
      }, res));
      let result = await fetch(`/api/articles/`);
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      let json = await result.json();
      this.setState({
        loading: false,
        error: null,
        filteredArticles: json.articles,
        data:json.articles
      });
    } catch(e) {
      this.setState({
        loading: false,
        error: e,
      });
    }
  }

  componentWillMount() {
    this.fetch();
  }
  getTerritoryName(id){
    let territoryName=[];
    let territories = this.state.territories.filter((obj)=>{
      if(id.includes(obj["_id"])) return obj;
    });
    if(territories.length>0) territoryName = territories.map(obj=>obj["key"]);
    return territoryName;
  }
  collateTerritories(ev){
    var options = ev.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    if(this.state.loading) return;
    let updatedTerritories = [...value];
    this.setState({
      selectedTerritories: updatedTerritories,
    });
  }
  
  filterArticles(){
    console.log(this.state.selectedTerritories);
    this.allArticles(this.state.selectedTerritories).then((result)=>{
      console.log(result);
      let allResults = [];
      let uniqueFilteredArticles = [];
      result.forEach((curr,index)=>{
        console.log(curr);
        allResults.push(...curr["articles"]);
      });
      console.log("allResults",allResults);
       let articleIds = allResults.map((obj)=>{
        return obj["_id"];
      });
      let uniqueIds = [];
      for(let i=0;i<articleIds.length;i++){
        if(uniqueIds.length===0){
          uniqueIds.push(articleIds[i])
        }else{
          if(uniqueIds.indexOf(articleIds[i])==-1){
            uniqueIds.push(articleIds[i])
          }
        }
      }
      console.log(uniqueIds);
      let filterIds = [];
      // uniqueIds = [1,2,3];
      // result = [[1,2,3],[2,3],[2,3,4],[5,3]];
      for(let i=0;i<uniqueIds.length;i++){
        let commonInAllResults = true;
        for(let j=0;j<result.length;j++){
          let articles = result[j]["articles"];
          // let articles = result[j];
          let filteredArticles = articles.filter((obj)=>{
            return (obj["_id"] === uniqueIds[i])
            // return (obj === uniqueIds[i])
          });
          if(filteredArticles.length===0){
            commonInAllResults = false;
          }
        }
        if(commonInAllResults){
          filterIds.push(uniqueIds[i]);
        }
      }
      console.log(filterIds);
      uniqueFilteredArticles = filterIds.map((id)=>{
        let articleObj = allResults.filter((article)=>{
          return (id===article["_id"])
        });
        return articleObj[0];
      })
      console.log(uniqueFilteredArticles);

      this.setState({
        loading: false,
        error: null,
        filteredArticles:uniqueFilteredArticles,
        selectedTerritories:[]
      });
    })
  }
  clearFilters(){
    this.setState({
      loading: false,
      error: null,
      filteredArticles:this.state.data
    });
  }
  render() {
    if(this.state.error) {
      return <div>{this.state.error.toString()}</div>;
    }
    if(this.state.loading) {
      return <div>Loading</div>;
    }
    let selectOptions = this.state.territories.map((obj)=>{
      return (<option key={obj._id} value={obj._id}>{obj.key}</option>)
    })
    return (
      <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
        <div>
          <div>Select Territories</div>
          <div>
            <Input style={{minHeight:'500px'}} 
                  onChange={e => this.collateTerritories(e)}
                  type="select" name="territories" id="territories" 
              multiple>
              {(this.state.territories.length>0)?(selectOptions):null}
            </Input>
            <Button onClick={this.filterArticles}>Filter</Button>
            <Button onClick={this.clearFilters}>Clear</Button>
          </div>
        </div>
        <div>
          <Button tag={Link} to='/articles/create'>Create a new Article</Button>
          <ul className='ArticleList'>
          {this.state.filteredArticles.map(article =>
            <li key={article._id}>
              <div>{new Date(article.created).toLocaleDateString()}</div>
              <Link to={`/articles/${article._id}/`}>
                <h4>{article.title}</h4>
              </Link>
              <div>{article.content}</div>
              <div>{
              (this.getTerritoryName(article.territories).length>0)?(this.getTerritoryName(article.territories).join(' - ')):null}</div>
            </li>
          )}
        </ul>
        </div>

      </div>
    );
  }
}

export default List;
