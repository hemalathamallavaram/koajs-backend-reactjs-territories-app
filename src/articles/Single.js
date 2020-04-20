import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

class Single extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      title: '',
      content: '',
      territories:[],
      selectedTerritories:[],
      errors: {},
    };
  }

  updateTitle(ev) {
    if(this.state.loading) return;
    this.setState({
      title: ev.target.value,
    });
  }

  updateContent(ev) {
    if(this.state.loading) return;
    this.setState({
      content: ev.target.value,
    });
  }
  updateTerritories(ev) {
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
  async fetch(id) {
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
    if(!id) {
      id = this.props.match.params.articleId;
    }
    try {
      await new Promise(res => this.setState({
        loading: true,
      }, res));
      let result = await fetch(`/api/articles/${id}/`);
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
        id: json.article._id,
        title: json.article.title,
        content: json.article.content,
        selectedTerritories:json.article.territories
      });
    } catch(e) {
      this.setState({
        loading: false,
        error: e,
      });
    }
  }

  submit() {
    this.setState({
      loading: true,
    }, async () => {
      let result = await fetch(`/api/articles/${this.state.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: this.state.title,
          content: this.state.content,
          territories:this.state.selectedTerritories
        }),
      });
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      let json = await result.json();
      if(json.success) {
        this.props.history.push('/');
      } else {
        this.setState({
          loading: false,
          errors: json.errors,
        });
      }
    });
  }


  componentWillMount() {
    this.fetch();
  }

  componentWillReceiveProps(newProps) {
    if(this.props.match.params.articleId !== newProps.match.params.articleId) {
      this.fetch(newProps.match.params.articleId);
    }
  }
  findIfArticleSelected(articles,id) {
    let filteredArticles = articles.filter((obj)=>obj===id);
    if(filteredArticles.length>0) return true;
    else false;
  }
  render() {
    if(this.state.error) {
      return <div>{this.state.error.toString()}</div>;
    }
    let selectedOptions = this.state.territories.map((obj)=>{
      let optionEle = null;
        if(this.findIfArticleSelected(this.state.selectedTerritories,obj['_id'])){
          optionEle = (<option key={obj._id} selected value={obj._id}>{obj.key}</option>)
        }else{
          optionEle = (<option key={obj._id} value={obj._id}>{obj.key}</option>)
        }
      return optionEle;
    });
    return (
      <Form>
        <FormGroup row>
          <Label for="title" sm={2}>Title</Label>
          <Col sm={10}>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="Title"
              sm={10}
              onChange={e => this.updateTitle(e)}
              value={this.state.title}
              disabled={this.state.loading}
              invalid={this.state.errors.title} />
            {
              this.state.errors.title ?
                <FormFeedback>{this.state.errors.title.message}</FormFeedback>
              : ''}
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="content" sm={2}>Content</Label>
          <Col sm={10}>
            <Input
              type="textarea"
              name="content"
              id="content"
              placeholder="Article Content"
              onChange={e => this.updateContent(e)}
              value={this.state.content}
              disabled={this.state.loading} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="territories" sm={2}>Territories</Label>
          <Col sm={10}>
            <Input type="select" name="territories" id="territories" 
              onChange={e => this.updateTerritories(e)}
              multiple>
              {(this.state.territories.length>0)?(selectedOptions):null}
            </Input>
            {
              this.state.errors.territories ?
                <FormFeedback>{this.state.errors.territories.message}</FormFeedback>
              : ''}
          </Col>
        </FormGroup>
        <FormGroup check row>
          <Col sm={{ size: 10, offset: 2 }}>
            <Button onClick={() => this.submit()}  disabled={this.state.loading}>Submit</Button>
            <Button tag={Link} to='/' disabled={this.state.loading}>Cancel</Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

export default Single;
